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
    Connected,
    Registered,
    GameStatus
}


export interface ResponseMessage {
    responseType: ResponseType;
}

export interface RegisteredResponseMessage extends ResponseMessage {
    sessionId: string
}    


export interface ConnectedResponseMessage extends ResponseMessage {
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