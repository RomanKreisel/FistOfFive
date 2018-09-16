import * as http from 'http';
import * as WebSocket from 'ws';
import {FistOfFiveSession} from './fist-of-five-session';
import { start } from 'repl';
import { RequestMessage, RequestType, RegisterRequestMessage, VoteRequestMessage, GameRestartRequestMessage } from './messages';
import { IdGenerator } from './id-generator';

export class FistOfFiveServer {
    private server: WebSocket.Server;
    private sessionsForSessionIds = new Map<string, FistOfFiveSession>();
    private sessionsForClientIds = new Map<string, FistOfFiveSession>();

    constructor(websocketServer: WebSocket.Server){
        this.server = websocketServer;
    }

    start() {
        //initialize the WebSocket server instance

        setInterval(() => {
            //TODO: clear sessionsForSessionIDs and sessionsForClientIDs
            this.sessionsForSessionIds.forEach((value,key,map)=>
            {
                if(value.clients.size === 0){
                    map.delete(key);
                }
            });
            this.sessionsForClientIds.forEach((value,key,map)=>
            {
                if(value.clients.size === 0){
                    map.delete(key);
                }
            });
        }, 60000);

        this.server.on('connection', (ws: WebSocket) => {
            let clientId = IdGenerator.generateId(32);

            ws.on('message', (message: string) => {
                let messageObject: RequestMessage = JSON.parse(message);
                if(messageObject.requestType === RequestType.Register){
                    this.register(clientId, ws, <RegisterRequestMessage> messageObject);
                    let example: VoteRequestMessage = {
                        requestType: RequestType.Vote,
                        fingers: 3
                    };
                    ws.send(JSON.stringify(example));
                } else if (messageObject.requestType === RequestType.Vote){
                    let voteMessage = <VoteRequestMessage> messageObject;
                    let session = (<FistOfFiveSession>this.sessionsForClientIds.get(clientId));
                    if(session){
                        session.vote(clientId, voteMessage.fingers);
                    }
                } else if (messageObject.requestType === RequestType.GameRestart){
                    let restartMessage = <GameRestartRequestMessage> messageObject;
                    let session = (<FistOfFiveSession>this.sessionsForClientIds.get(clientId));
                    if(session){
                        session.restartGame(clientId);
                    }

                }
            });

            ws.on('close', () => {
                this.unregister(clientId);
            });

            let example: RegisterRequestMessage = {
                requestType: RequestType.Register,
                sessionId: 'abc',
                userName: 'Roman'
            };
            ws.send(JSON.stringify(example));

        });
    }

    private unregister(clientId: string){
        if(this.sessionsForClientIds.has(clientId)){
            let session = <FistOfFiveSession> this.sessionsForClientIds.get(clientId);
            session.unregisterClient(clientId);
            if(session.clients.size == 0){
                this.sessionsForSessionIds.delete(session.sessionId);
            }
            this.sessionsForClientIds.delete(clientId);
        }
    }


    private register(clientId: string, websocket: WebSocket, registerMessage: RegisterRequestMessage){
        if(this.sessionsForSessionIds.has(clientId)){
            console.error('Register Message received, when client was already registered');
            this.unregister(clientId);
        }

        if(!registerMessage.sessionId){
            registerMessage.sessionId = IdGenerator.generateId(32);
        }
        if(this.sessionsForSessionIds.has(registerMessage.sessionId)){
            let session = <FistOfFiveSession> this.sessionsForSessionIds.get(registerMessage.sessionId);
            session.registerClient(clientId, registerMessage.userName, websocket);
            this.sessionsForClientIds.set(clientId, session);
        } else {
            let session = new FistOfFiveSession(registerMessage.sessionId);
            session.registerClient(clientId, registerMessage.userName, websocket);
            this.sessionsForSessionIds.set(session.sessionId, session);
            this.sessionsForClientIds.set(clientId, session);
        }
    }
}