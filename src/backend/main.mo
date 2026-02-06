import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// CLUES ------------
  public type Clue = {
    id : Nat;
    title : Text;
    statement : Text;
    answer : Text;
    media : ?Media;
  };

  public type Media = {
    #imageUrl : Text;
    #videoUrl : Text;
    #pptUrl : Text;
  };

  public type ClueSummary = {
    id : Nat;
    title : Text;
    statement : Text;
    media : ?Media;
  };

  let clues = Map.empty<Nat, Clue>();
  var nextClueId = 1;

  public shared ({ caller }) func createClue(clue : Clue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create clues");
    };
    let clueWithId = { clue with id = nextClueId };
    clues.add(nextClueId, clueWithId);
    nextClueId += 1;
  };

  public shared ({ caller }) func editClue(clueId : Nat, updatedFields : ?Clue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit clues");
    };

    switch (clues.get(clueId)) {
      case (null) { Runtime.trap("Clue not found") };
      case (?existingClue) {
        let updatedClue = switch (updatedFields) {
          case (null) { existingClue };
          case (?fields) {
            {
              existingClue with
              title = fields.title;
              statement = fields.statement;
              answer = fields.answer;
              media = fields.media;
            };
          };
        };
        clues.add(clueId, updatedClue);
      };
    };
  };

  public shared ({ caller }) func reassignClueId(oldId : Nat, newId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reassign clue IDs");
    };

    switch (clues.get(oldId)) {
      case (null) { Runtime.trap("Clue not found") };
      case (?clue) {
        if (clues.containsKey(newId)) {
          Runtime.trap("New ID already exists");
        } else {
          clues.remove(oldId);
          let clueWithUpdatedId = { clue with id = newId };
          clues.add(newId, clueWithUpdatedId);
        };
      };
    };
  };

  public query ({ caller }) func getClueSummary(clueId : Nat) : async ClueSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clues");
    };
    switch (clues.get(clueId)) {
      case (null) { Runtime.trap("Clue not found") };
      case (?clue) {
        {
          id = clue.id;
          title = clue.title;
          statement = clue.statement;
          media = clue.media;
        };
      };
    };
  };

  public query ({ caller }) func getAllClueSummaries() : async [ClueSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clues");
    };
    clues.values().toArray().map(
      func(clue) {
        {
          id = clue.id;
          title = clue.title;
          statement = clue.statement;
          media = clue.media;
        };
      }
    );
  };

  public query ({ caller }) func getFirstAvailableClueSummary() : async ClueSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clues");
    };
    let entriesArray = clues.toArray();
    if (entriesArray.size() == 0) {
      Runtime.trap("No clues available");
    };

    var minId : ?Nat = null;
    for ((id, _) in entriesArray.values()) {
      switch (minId) {
        case (null) { minId := ?id };
        case (?currentMin) {
          if (id < currentMin) {
            minId := ?id;
          };
        };
      };
    };

    switch (minId, clues) {
      case (null, _) { Runtime.trap("Unexpected error: No clues found") };
      case (?id, clues) {
        switch (clues.get(id)) {
          case (null) {
            Runtime.trap("Unexpected error: Clue not found");
          };
          case (?clue) {
            {
              id = clue.id;
              title = clue.title;
              statement = clue.statement;
              media = clue.media;
            };
          };
        };
      };
    };
  };

  /// ANSWERS / GAME LOGIC ------------
  public type AnswerResult = {
    correct : Bool;
    nextClueId : ?Nat;
  };

  public shared ({ caller }) func submitAnswer(clueId : Nat, answer : Text) : async AnswerResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };
    switch (clues.get(clueId)) {
      case (null) { Runtime.trap("Clue not found") };
      case (?clue) {
        let correct = clue.answer.trim(#char ' ').toLower() == answer.trim(#char ' ').toLower();
        let nextClueId = if (correct) { findNextClueId(clueId) } else { null };

        {
          correct;
          nextClueId;
        };
      };
    };
  };

  func findNextClueId(currentId : Nat) : ?Nat {
    let entriesArray = clues.toArray();
    var nextId : ?Nat = null;

    for ((id, _) in entriesArray.values()) {
      if (id > currentId) {
        switch (nextId) {
          case (null) { nextId := ?id };
          case (?currentNext) {
            if (id < currentNext) {
              nextId := ?id;
            };
          };
        };
      };
    };
    nextId;
  };

  public shared ({ caller }) func deleteClue(clueId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clues");
    };

    if (clues.containsKey(clueId)) {
      clues.remove(clueId);
    } else {
      Runtime.trap("Clue not found");
    };
  };

  public shared ({ caller }) func clearAllClues() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear all clues");
    };
    clues.clear();
  };
};
