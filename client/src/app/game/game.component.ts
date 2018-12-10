import { Component, OnInit, NgModule } from '@angular/core';
import { GameService } from '../game.service';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClientMessage, GameStatusResponseMessage } from '../../../../common/src/messages';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private myVote: number = -1;
  private step = 0;
  private lastGameStatusUpdateVoteAllowed = true;
  private messageQueue: string[] = [];

  constructor(
    private gameService: GameService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public snackBar: MatSnackBar
  ) {
  }

  public getStep() {
    return this.step;
  }

  public setStep(step: number) {
    this.step = step;
  }

  public get sessionId(): string {
    return this.gameService.sessionId;
  }

  public get clients(): ClientMessage[] {
    return this.gameService.clients;
  }

  public canRestart() {
    return this.gameService.canRestart();
  }

  public canVote() {
    return this.gameService.canVote();
  }

  public alreadyVoted() {
    return this.gameService.alreadyVoted();
  }

  public vote(fingers: number) {
    this.gameService.vote(fingers);
  }

  public get lastToVote() {
    let alreadyVoted = this.gameService.alreadyVoted();
    if(!alreadyVoted && (this.gameService.clients.length - this.gameService.numberOfPlayersWhoAlreadyVoted) == 1){
      return true;
    }
    return false;
  }

  public get canShare(): boolean {
    if(navigator['share']){
      return true;
    }
  }

  public get votingText() {
    let alreadyVoted = this.gameService.alreadyVoted();
    let votesOutstanding = this.gameService.clients.length - this.gameService.numberOfPlayersWhoAlreadyVoted;
    if (alreadyVoted && votesOutstanding > 1) {
      return "Thank you for voting, please wait for another " + (this.gameService.clients.length - this.gameService.numberOfPlayersWhoAlreadyVoted) + " votes";
    } else if (alreadyVoted && votesOutstanding == 1) {
      let missingClient = this.clients.find((client) => {
        return !client.hasVoted;
      });
      return "Thank you for voting, please wait for the vote of " + missingClient.username;
    } else if (alreadyVoted){
      return "Thank you for voting";
    } else if (this.lastToVote){
      return "Please vote, everybody else already did!";
    } else {
      return "Please vote";
    }
  }

  public get voteSummary() {
    if(this.canVote()){
      return "";
    } else {
      let sum = 0;
      this.gameService.clients.forEach((client) => {
        if(client.vote >= 0){
          sum += client.vote;
        }
      });
      let average = sum / this.gameService.clients.length;
      return "The average vote was " + average.toFixed(1);
    }
  }

  public restart() {
    this.gameService.restart();
  }

  public shareURL() {
    if (navigator['share']) {
      navigator['share']({
          title: 'Fist of Five Game',
          text: 'Let\'s play \'Fist of Five\'',
          url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
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
    if (this.gameService.sessionId == null) {
      var sessionId = '';
      this.activatedRoute.paramMap.subscribe((value) => {
        sessionId = value.get('sessionId');
      });
      if (sessionId) {
        this.router.navigateByUrl('login/' + sessionId);
      } else {
        this.router.navigateByUrl('login');
      }
    } else {
      this.gameService.subscribeStatusListener(() => {
        if (this.gameService.clients.length == 1) {
          this.setStep(0);
        } else {
          if (this.gameService.canVote()) {
            if (!this.lastGameStatusUpdateVoteAllowed || this.getStep() == 0) {
              this.setStep(1);
            }
            this.lastGameStatusUpdateVoteAllowed = true;
          } else {
            if (this.getStep() == 1) {
              this.setStep(2);
            }
            this.lastGameStatusUpdateVoteAllowed = false;
          }
        }
      });

      this.gameService.subscribeClientListener((clientsJoined, clientsLeft) => {
        let openNextMessage = false;
        if(this.messageQueue.length == 0){
          openNextMessage = true;
        }

        let joinMessage = "";
        clientsJoined.forEach((client, index, array) => {
          if(!client.thisIsYou){
            if(index > 0 && index < array.length-1){
              joinMessage += ", ";
            } else if (index > 0){
              joinMessage += " and ";
            }
            joinMessage+=client.username;
          }
        });
        if(clientsJoined.length > 1){
          joinMessage += " have joined";
        } else if (clientsJoined.length === 1){
          joinMessage += " has joined";
        }
        if(joinMessage){
          this.messageQueue.push(joinMessage);
        }

        let leaveMessage = "";
        clientsLeft.forEach((client, index, array) => {
          if(!client.thisIsYou){
            if(index > 0 && index < array.length-1){
              leaveMessage += ", ";
            } else if (index > 0){
              leaveMessage += " and ";
            }
            leaveMessage+=client.username;
          }
        });
        if(clientsLeft.length > 1){
          leaveMessage += " have left";
        } else if (clientsLeft.length === 1){
          leaveMessage += " has left";
        }
        if(leaveMessage){
          this.messageQueue.push(leaveMessage);
        }

        if(openNextMessage){
          this.openNextMessage();
        }
      })
    }
  }

  private openNextMessage() {
    if(this.messageQueue.length > 0){
      this.snackBar.open(this.messageQueue.shift(), undefined, { duration: 5000 })
      .afterDismissed().subscribe(() => {
        this.openNextMessage();
      })
    }
  }

}
