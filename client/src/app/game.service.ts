import { Injectable, EventEmitter } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { RegisterRequestMessage, RequestType, RequestMessage, ClientMessage, ResponseMessage, ResponseType, GameStatusResponseMessage, RegisteredResponseMessage, VoteRequestMessage, GameRestartRequestMessage } from '../../../common/src/messages';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public clients: ClientMessage[] = [];
  public sessionId: string;
  private socket: SocketIOClient.Socket;
  private statusListeners: Array<() => void> = [];
  private clientsListeners: Array<(clientsJoined: Array<ClientMessage>, clientsLeft: Array<ClientMessage>) => void> = [];

  constructor(
    private router: Router
  ) { 
    if(isDevMode()){
      console.log("DevMode active! Listening on Port 8999")
      this.socket = socketIo('http://localhost:8999');
    } else {
      this.socket = socketIo();
    }
    this.socket.on('message', (responseMessage: ResponseMessage) => {
      if(isDevMode() && console){
        console.log('Incoming message', responseMessage);
      }
      switch(responseMessage.responseType){
        case ResponseType.Connected:
          if(isDevMode() && console){
            console.log("Connected to backend service");
          }
          break;
        case ResponseType.Registered:
          let registeredResponseMessage = <RegisteredResponseMessage>responseMessage;
          this.sessionId = registeredResponseMessage.sessionId;
          this.router.navigateByUrl('game/' + this.sessionId)
          if(isDevMode() && console){
            console.log("Registered in session \"" + this.sessionId + "\"");
          }
          break;
        case ResponseType.GameStatus:
          let gameStatusMessage = <GameStatusResponseMessage>responseMessage;
          if(isDevMode() && console){
            console.log("GameStatus received: ", gameStatusMessage);
          }

          let clientsJoined: ClientMessage[] = [];
          gameStatusMessage.clients.forEach((client) => {
            if(!client.thisIsYou && !this.clients.find((existingClient) => {
              return existingClient.username === client.username;
            })){
              clientsJoined.push(client);
            }
          });

          let clientsLeft: ClientMessage[] = [];
          this.clients.forEach((client) => {
              if(!client.thisIsYou && !gameStatusMessage.clients.find((newClient) => {
                return newClient.username === client.username;
              })){
                clientsLeft.push(client);
              }
          });
          this.clientsListeners.forEach((listener) => {
            listener(clientsJoined, clientsLeft);
          });

          this.clients.splice(0);
          gameStatusMessage.clients.forEach((client) => {
            if(client.thisIsYou){
              this.clients.push(client);
            }
          });
          gameStatusMessage.clients.forEach((client) => {
            if(!client.thisIsYou){
              this.clients.push(client);
            }
          });
          this.statusListeners.forEach((listener) => {
            listener();
          })
          break;
        default:
          if(console){
            console.error("Unknown message from server: ", responseMessage);
          }
      }
    });
  }

  public connect(username: string, sessionId: string){

    let message: RegisterRequestMessage = {
      requestType: RequestType.Register,
      sessionId: sessionId, 
      userName: username
    }
    this.socket.send(message);
  }

  public get myClient() {
    let myClients = this.clients.filter((client) => {
      return client.thisIsYou
    });
    if(myClients.length > 0){
      return myClients[0];
    } else {
      return null;
    }
  }

  public get numberOfPlayersWhoAlreadyVoted() {
    return this.clients.filter((client) => {
      return client.hasVoted
    }).length;
  }

  public canVote() {
    let myClient = this.myClient;
    return myClient && (!myClient.hasVoted || myClient.vote < 0);
  }

  public alreadyVoted() {
    let myClient = this.myClient;
    return myClient && myClient.hasVoted;
  }

  public vote(fingers: number) {
    let message: VoteRequestMessage = {
      requestType: RequestType.Vote,
      fingers: fingers
    }
    this.socket.send(message);
  }

  public canRestart() {
    let myClient = this.myClient;
    return myClient && myClient.isAdmin
  }

  public restart(){
    let message: GameRestartRequestMessage = {
      requestType: RequestType.GameRestart
    };
    this.socket.send(message);
  }

  public subscribeStatusListener(listener: () => void){
    this.statusListeners.push(listener);
  }

  public subscribeClientListener(listener: (clientsJoined: Array<ClientMessage>, clientsLeft: Array<ClientMessage>) => void){
    this.clientsListeners.push(listener);
  }

}
