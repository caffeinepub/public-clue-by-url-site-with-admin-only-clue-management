import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Clue {
    id: bigint;
    media?: Media;
    title: string;
    statement: string;
    answer: string;
}
export interface AnswerResult {
    correct: boolean;
    nextClueId?: bigint;
}
export type Media = {
    __kind__: "imageUrl";
    imageUrl: string;
} | {
    __kind__: "pptUrl";
    pptUrl: string;
} | {
    __kind__: "videoUrl";
    videoUrl: string;
};
export interface UserProfile {
    name: string;
}
export interface ClueSummary {
    id: bigint;
    media?: Media;
    title: string;
    statement: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllClues(): Promise<void>;
    createClue(clue: Clue): Promise<void>;
    deleteClue(clueId: bigint): Promise<void>;
    editClue(clueId: bigint, updatedFields: Clue | null): Promise<void>;
    getAllClueSummaries(): Promise<Array<ClueSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClueSummary(clueId: bigint): Promise<ClueSummary>;
    getFirstAvailableClueSummary(): Promise<ClueSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reassignClueId(oldId: bigint, newId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAnswer(clueId: bigint, answer: string): Promise<AnswerResult>;
}
