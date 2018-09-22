import { Component } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent  {
  gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
   }

  public username = '';
  public sessionId = '';


  public get buttonText()
  {
    if(this.sessionId){
      return 'Join game';
    } else {
      return 'Start new game'
    }
  }

  public get buttonDisabled()
  {
    if(this.username){
      return false;
    }
    return true;
  }

  public refresh(){
    console.log('username: ' + this.username);
    console.log('sessionId: ' + this.sessionId);
    this.gameService.connect(this.username, this.sessionId);
  }

}
