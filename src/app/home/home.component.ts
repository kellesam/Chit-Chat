import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ChatService } from '../chat/chat.service';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor( private _http: HttpClient,
               private _cs: ChatService,
               private _router: Router,
               private _alert: AlertService
             ) { }

  url = "/api/rooms/";

  ngOnInit() {
  }

  onCreate () {
    this._http.post(this.url, null)
      .subscribe( response => {
        this._router.navigate(['chat', response['id']]);
      });
  }

  onJoin (room: String) {
    this._http.get(this.url + room)
      .subscribe(
        (response) => {
          this._router.navigate(['chat', room]);
        },
        (error: HttpResponse<HttpErrorResponse>) => {
          if (error.status == 404) {
            this._alert.alert('Oh no! That room doesn\'t exist.');
          }
        }
      );
  }

}
