import * as http from 'http';
import {FistOfFiveSession} from './fist-of-five-session';
import { RequestMessage, RequestType, RegisterRequestMessage, VoteRequestMessage, GameRestartRequestMessage, ConnectedResponseMessage, ResponseType, RegisteredResponseMessage } from '../../common/src/messages';
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
                console.log("Incoming message: ", requestMessage)
                if(requestMessage.requestType === RequestType.Register){
                    let sessionId = this.register(clientId, socket, <RegisterRequestMessage> requestMessage);
                    let registeredResponse: RegisteredResponseMessage = {
                        responseType: ResponseType.Registered,
                        sessionId: sessionId
                    };
                    socket.send(registeredResponse);
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

            socket.on('disconnecting', () => {
                this.unregister(clientId);
            });

            socket.on('error', (error) => {
                console.log('Error occurred: ' + error);
                this.unregister(clientId);
            });


            let connectedMessage: ConnectedResponseMessage = {
                responseType: ResponseType.Connected
            };
            socket.send(connectedMessage);
        });



        setInterval(() => {
            //TODO: clear sessionsForSessionIDs and sessionsForClientIDs
            this.sessionsForSessionIds.forEach((value,key,map)=>
            {
                if(value.clients.size === 0){
                    map.delete(key);
                    console.log("Session " + key + " garbage collected");
                }
            });
            this.sessionsForClientIds.forEach((value,key,map)=>
            {
                if(value.clients.size === 0){
                    map.delete(key);
                    console.log("Client " + key + " garbage collected");
                }
            });
        }, 60000);

    }

    private unregister(clientId: string){
        if(this.sessionsForClientIds.has(clientId)){
            let session = <FistOfFiveSession> this.sessionsForClientIds.get(clientId);
            session.unregisterClient(clientId);
            if(session.clients.size == 0){
                console.log('Session ' + session.sessionId + ' lost all clients and will be removed.')
                this.sessionsForSessionIds.delete(session.sessionId);
            }
            this.sessionsForClientIds.delete(clientId);
        }
    }


    private register(clientId: string, websocket: SocketIO.Socket, registerMessage: RegisterRequestMessage): string{
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
        return registerMessage.sessionId;
    }
}