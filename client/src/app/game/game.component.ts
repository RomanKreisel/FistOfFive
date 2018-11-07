import { Component, OnInit, NgModule } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClientMessage } from '../../../../common/src/messages';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private myVote: number = -1;

  constructor(
    private gameService: GameService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { 
  }

  public get sessionId(): string {
    return this.gameService.sessionId;
  }

  public get clients(): ClientMessage[]  {
    return this.gameService.clients;
  }

  public canRestart() {
    return this.gameService.canRestart();
  }
  
  public vote(fingers: number){
    this.gameService.vote(fingers);
  }

  public restart() {
    this.gameService.restart();
  }

  public copyURL() {
    const el = document.createElement('textarea');
    el.value = window.location.href;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  ngOnInit() {
    if(this.gameService.sessionId == null){
      var sessionId = '';
      this.activatedRoute.paramMap.subscribe((value) => {
        sessionId = value.get('sessionId');
      });
      if(sessionId){
        this.router.navigateByUrl('login/' + sessionId);
      } else {
        this.router.navigateByUrl('login');
      }
    }
  }


}
