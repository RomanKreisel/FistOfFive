import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit  {
  gameService: GameService;
  public username = '';
  public sessionId = '';
  public sessionIdFieldAvailable = true;

  constructor(
    gameService: GameService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.gameService = gameService;
   }



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

  public login(){
    this.gameService.connect(this.username, this.sessionId);
  }

  ngOnInit() {
    if(this.gameService.sessionId == null){
      this.activatedRoute.paramMap.subscribe((value) => {
        this.sessionId = value.get('sessionId');
        if(this.sessionId){
          this.sessionIdFieldAvailable = false;
        }
      });
    }
  }

}
