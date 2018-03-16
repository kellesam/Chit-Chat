import { Component, AfterViewInit, Inject, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as io from 'socket.io-client';

import { ChatService } from './chat.service';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewInit {

  @ViewChild('messagesScroll') scroll: ElementRef;
  @ViewChildren('messages') messagesEl: QueryList<any>;
  url = '/api/rooms/';
  room: String;
  username: String = '';
  messages: Observable<any>;


  constructor( private _cs: ChatService,
               private dialog: MatDialog,
               private _route: ActivatedRoute,
               private _router: Router,
               private _http: HttpClient,
               private _alert: AlertService
  ) {

    this._route.params.subscribe(params => {

      this.room = params['room'];
      this._http.get(this.url + this.room)
        .subscribe(
          (response) => {
            let dialogRef = this.dialog.open(NameDialog, {
             width: '250px',
             disableClose: true,
             data: { room: this.room }
           });

           dialogRef.afterClosed().subscribe(result => {
             this.username = result;
             this._cs.setupChat({
               username: this.username,
               room: this.room
             });
             this._cs.join();
             this.messages = this._cs.getMessages();
           });

          },
          (error: HttpResponse<HttpErrorResponse>) => {
            if (error.status == 404) {
              this._router.navigate(['/']);
            }
          }

     );

    });

  }

  ngAfterViewInit () {
    this.messagesEl.changes.subscribe(
      (change) => {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
      }
    );
  }

}

@Component({
  selector: 'name-dialog',
  template: `
  <h1 mat-dialog-title>Hello!</h1>
  <div mat-dialog-content>
    <p>Please enter a nickname:</p>
    <form #f="ngForm" (ngSubmit)="onSubmit(f.value.username)">
      <mat-form-field>
        <input matInput placeholder="Name" name="username" [ngModel]="username" autocomplete="off" required>
      </mat-form-field>
      <button class="btn btn-sm btn-success" type="submit" [disabled]="f.invalid">Join</button>
    </form>
  </div>
  `
})
export class NameDialog {

  constructor(public dialogRef: MatDialogRef<NameDialog>,
              private _http: HttpClient,
              private _route: ActivatedRoute,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _alert: AlertService) { }

  url = '/api/rooms/obj/';
  unique = true;

  onSubmit(username) {
    if (username === null || username.match(/^\s*$/)) {
      this._alert.alert('Please enter a valid username.')
    }
    else {
      this._http.get(this.url + this.data.room)
      .subscribe(
        (response) => {
          console.log(response);
          if (response['userCount'] > 0 && response['users'].hasOwnProperty(username)) {
            this._alert.alert('Sorry, that name is taken.')
          }
          else {
            this.dialogRef.close(username);
          }
         });
    }
    
  }

}
