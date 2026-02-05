import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

module {
  public type Clue = Text;

  public type CluesState = {
    clues : Map.Map<Nat, Clue>;
    nextId : Nat;
  };

  public func empty() : CluesState {
    {
      clues = Map.empty<Nat, Clue>();
      nextId = 1;
    };
  };

  public func createClue(state : CluesState, clue : Clue) : CluesState {
    let id = state.nextId;
    let newClues = state.clues;
    newClues.add(id, clue);
    {
      clues = newClues;
      nextId = state.nextId + 1;
    };
  };

  public func getClue(state : CluesState, id : Nat) : Clue {
    switch (state.clues.get(id)) {
      case (null) { Runtime.trap("Clue not found") };
      case (?clue) { clue };
    };
  };

  public func listClues(state : CluesState) : [Clue] {
    state.clues.values().toArray();
  };

  public func deleteClue(state : CluesState, id : Nat) : CluesState {
    if (not state.clues.containsKey(id)) {
      Runtime.trap("Clue not found");
    } else {
      let newClues = state.clues;
      newClues.remove(id);
      {
        clues = newClues;
        nextId = state.nextId;
      };
    };
  };
};
