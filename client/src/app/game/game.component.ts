import { Component, OnInit, NgModule } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {

  constructor(
    private gameService: GameService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { 
  }

  public get sessionId(): string {
    return this.gameService.sessionId;
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
