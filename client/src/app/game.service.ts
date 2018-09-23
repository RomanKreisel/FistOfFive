import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { RegisterRequestMessage, RequestType, RequestMessage, ClientMessage, ResponseMessage, ResponseType, GameStatusResponseMessage, RegisteredResponseMessage } from '../../../common/src/messages';
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
            this.clients.push(client);
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
    


    /*let ws = new WebSocket('ws://localhost:8999');
    ws.onopen = (event) => {
      let message= {
        requestType: 0,
        sessionId: sessionId, 
        userName: username
      }
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event) => {
      console.log("received: " + event.data);
    };
    */
  }
}
