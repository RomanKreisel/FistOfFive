import * as http from 'http';
import {FistOfFiveSession} from './fist-of-five-session';
import { RequestMessage, RequestType, RegisterRequestMessage, VoteRequestMessage, GameRestartRequestMessage } from './messages';
import { IdGenerator } from './id-generator';
import SocketIO = require('socket.io');


export class FistOfFiveServer {
    private io: SocketIO.Server;
    private sessionsForSessionIds = new Map<string, FistOfFiveSession>();
    private sessionsForClientIds = new Map<string, FistOfFiveSession>();

    constructor(server: http.Server){
        this.io = SocketIO(server)

        this.io.on('connect', (socket: SocketIO.Socket) => {
            let clientId = IdGenerator.generateId(32);

            socket.on('message', (requestMessage: RequestMessage) => {
                if(requestMessage.requestType === RequestType.Register){
                    this.register(clientId, socket, <RegisterRequestMessage> requestMessage);
                    let example: VoteRequestMessage = {
                        requestType: RequestType.Vote,
                        fingers: 3
                    };
                    socket.send(example);
                } else if (requestMessage.requestType === RequestType.Vote){
                    let voteMessage = <VoteRequestMessage> requestMessage;
                    let session = (<FistOfFiveSession>this.sessionsForClientIds.get(clientId));
                    if(session){
                        session.vote(clientId, voteMessage.fingers);
                    }
                } else if (requestMessage.requestType === RequestType.GameRestart){
                    let restartMessage = <GameRestartRequestMessage> requestMessage;
                    let session = (<FistOfFiveSession>this.sessionsForClientIds.get(clientId));
                    if(session){
                        session.restartGame(clientId);
                    }

                }
            });

            socket.on('disconnect', () => {
                this.unregister(clientId);
            });

            let example: RegisterRequestMessage = {
                requestType: RequestType.Register,
                sessionId: 'abc',
                userName: 'Roman'
            };
            socket.send(example);
        });



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


    private register(clientId: string, websocket: SocketIO.Socket, registerMessage: RegisterRequestMessage){
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