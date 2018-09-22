import {FistOfFiveClient} from './fist-of-five-client';
import { GameStatusResponseMessage, ResponseType, ClientMessage } from './messages';
import SocketIO = require('socket.io');

export class FistOfFiveSession {

    private _sessionId: string;
    private _clients = new Map<string, FistOfFiveClient>();
    private clientIdsInOrder: Array<string> = [];
    private clientVotes: Array<string> = [];

    constructor(sessionId: string){
        this._sessionId = sessionId;
    }

    public registerClient(clientId: string, username: string, socket: SocketIO.Socket){
        this.clientIdsInOrder.push(clientId);
        this.clients.set(clientId, new FistOfFiveClient(clientId, username, socket));
        this.sendGameStatusResponse()
        console.log('Client ' + clientId + ' joined session ' + this.sessionId + ' ('+this.clients.size+' client(s) connected in this session)');
    }

    public unregisterClient(clientId: string){
        if(this.clientIdsInOrder.indexOf(clientId) === -1){
            return;
        }
        this.clientVotes = this.clientVotes.filter((value) => {
            value !== clientId
        });
        this.clientIdsInOrder = this.clientIdsInOrder.filter((value) => {
            value !== clientId
        });
        this.clients.delete(clientId);
        this.sendGameStatusResponse()
        console.log('Client ' + clientId + ' left session ' + this.sessionId + ' ('+this.clients.size+' client(s) connected in this session)');
    }

    public vote(clientId: string, vote: number){
        if(vote < 1 || vote > 5){
            console.log('Client ' + clientId + ' voted ' + vote + ', which isn\'t allowed');
            return;
        }
        let client = <FistOfFiveClient> this.clients.get(clientId);
        client.vote = vote;
        if(this.clientVotes.indexOf(clientId) === -1){
            this.clientVotes.push(clientId);
        }
        this.sendGameStatusResponse();
        console.log('Client ' + clientId + ' voted');
        if(this.clientVotes.length >= this.clientIdsInOrder.length){
            console.log('Game complete with ' + this.clientVotes.length + ' votes');
        }
    }

    restartGame(clientId: string): any {
        if(this.areYouAdmin(clientId)){
            this.clientVotes = this.clientVotes.slice(0);
            this.sendGameStatusResponse();
        } else {
            console.log('Client ' + clientId + 'tried to reset the game, but isn\'t admin');
        }
    }


    get sessionId() {
        return this._sessionId;
    }


    get clients() {
        return this._clients;
    }

    private sendGameStatusResponse(){
        let clientsToUnregister = [];
        for(let clientId of this.clients.keys()){
            let client = this.clients.get(clientId);
            if(client instanceof FistOfFiveClient){
                // try {
                    client.socket().send(this.getGameStatusResponseMessage(clientId));
                /*
                }catch(error){
                    console.log('Error sending message to client ' + clientId + '. Client will be unregistered from this session');
                    setTimeout(() => {
                        this.unregisterClient(clientId);
                    }, 100);
                }
                    */
                }
        }
    }

    private getGameStatusResponseMessage(myClientId: string): GameStatusResponseMessage{
        let clients: ClientMessage[] = [];

        for(let clientId of this.clients.keys()){
            let client = <FistOfFiveClient> this.clients.get(clientId);
            let clientMessage = this.getClientMessage(clientId, client, myClientId, this.clientVotes.length >= this.clientIdsInOrder.length)
            clients.push(clientMessage);
        }

        let message: GameStatusResponseMessage = {
            responseType: ResponseType.GameStatus,
            clients: clients
        }
        return message;
    }

    private areYouAdmin(myClientId: string): boolean {
        return this.clientIdsInOrder[0] === myClientId;;
    }

    private getClientMessage(clientId: string, client: FistOfFiveClient, myClientId: string, showVotes: boolean): ClientMessage{
        let message: ClientMessage = {
            username: client.username(),
            hasVoted: client.vote > -1,
            thisIsYou: clientId === myClientId,
            isAdmin: this.areYouAdmin(clientId),
            vote: showVotes?client.vote:-1
        }
        return message;
    }

}

