import SocketIO = require('socket.io');

export class FistOfFiveClient {

    private _clientId: string;
    private _username: string;
    private _socket: SocketIO.Socket;

    public vote: number = -1;

    constructor(clientId: string, username: string, socket: SocketIO.Socket){
        this._clientId = clientId;
        this._username = username;
        this._socket = socket;
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

    socket(){
        get:
        {
            return this._socket;
        }
    }
}