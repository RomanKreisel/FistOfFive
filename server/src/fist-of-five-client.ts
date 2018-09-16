import * as WebSocket from 'ws';

export class FistOfFiveClient {

    private _clientId: string;
    private _username: string;
    private _websocket: WebSocket;

    public vote: number = -1;

    constructor(clientId: string, username: string, websocket: WebSocket){
        this._clientId = clientId;
        this._username = username;
        this._websocket = websocket;
    }

    clientId() {
        get:
        {
            return this._clientId;
        }
    }

    username() {
        get:
        {
            return this._username;
        }
    }

    websocket(){
        get:
        {
            return this._websocket;
        }
    }
}