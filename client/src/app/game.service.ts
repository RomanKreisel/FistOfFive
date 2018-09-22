import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
// import { RegisterRequestMessage, RequestType } from './messages.d';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { 

  }

  public connect(username: string, sessionId: string){
    let socket = socketIo('http://localhost:8999');
    socket.on('message', (data: any) => {
      console.log('message:');
      console.log(data);
    });

    let message= {
      requestType: 0,
      sessionId: sessionId, 
      userName: username
    }
    socket.send(message);
    


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
