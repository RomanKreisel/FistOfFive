import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { RegisterRequestMessage, RequestType, RequestMessage, ClientMessage, ResponseMessage, ResponseType, GameStatusResponseMessage, RegisteredResponseMessage, VoteRequestMessage, GameRestartRequestMessage } from '../../../common/src/messages';
import { environment } from '../environments/environment.prod';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public clients: ClientMessage[] = [];
  public sessionId: string;
  private socket: SocketIOClient.Socket;

  constructor(
    private router: Router
  ) { 
    // if(isDevMode()){
    //  this.socket = socketIo();
    //} else {
      this.socket = socketIo('http://localhost:8999');
    //}
    this.socket.on('message', (responseMessage: ResponseMessage) => {
      console.log('Incoming message', responseMessage);
      switch(responseMessage.responseType){
        case ResponseType.Connected:
          console.log("Connected to backend service");
          break;
        case ResponseType.Registered:
          let registeredResponseMessage = <RegisteredResponseMessage>responseMessage;
          this.sessionId = registeredResponseMessage.sessionId;
          this.router.navigateByUrl('game/' + this.sessionId)
          console.log("Registered in session \"" + this.sessionId + "\"");
          break;
        case ResponseType.GameStatus:
          let gameStatusMessage = <GameStatusResponseMessage>responseMessage;
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
          break;
        default:
          console.error("Unknown message from server: ", responseMessage);
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

  public canVote() {
    let myClient = this.myClient;
    return myClient && myClient.hasVoted && myClient.vote > 0;
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

}
