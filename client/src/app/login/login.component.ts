import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent  {

  constructor() { }

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
  }

}
