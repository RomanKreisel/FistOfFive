import { Injectable } from '@angular/core';
// import { RegisterRequestMessage, RequestType } from './messages.d';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  wss: WebSocket;

  constructor() { 

  }

  public connect(username: string, sessionId: string){
    let ws = new WebSocket('ws://localhost:8999');
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
  }
}
