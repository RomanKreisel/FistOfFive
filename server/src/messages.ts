import { FistOfFiveClient } from "./fist-of-five-client";


/*
 * Requests (client -> server)
 */

export enum RequestType {
    Register,
    Vote,
    GameRestart
}


export interface RequestMessage {
    requestType: RequestType;
}

export interface RegisterRequestMessage extends RequestMessage {
    userName: string;
    sessionId: string;
}

export interface VoteRequestMessage extends RequestMessage {
    fingers: number;
}

export interface GameRestartRequestMessage extends RequestMessage {
}


export interface RequestMessage {
    requestType: RequestType;
}

/*
 * Responses (server -> client)
 */

export enum ResponseType {
    GameStatus
}

export interface ResponseMessage {
    responseType: ResponseType;
}

export interface GameStatusResponseMessage extends ResponseMessage {
    clients: ClientMessage[],
}

export interface ClientMessage {
    username: string,
    thisIsYou: boolean,
    isAdmin: boolean,
    hasVoted: boolean,
    vote: number

}