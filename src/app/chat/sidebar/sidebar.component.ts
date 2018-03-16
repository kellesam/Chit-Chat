import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { Observable, Subject } from 'rxjs/Rx';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['../chat.component.css']
})
export class SidebarComponent implements OnInit {

  users: Observable<any>;
  userCount: Observable<any>;

  constructor (private _cs: ChatService) {

    this.users = this._cs.getUsers();
    this.userCount = this._cs.getUserCount();

  }

  ngOnInit() {
  }

}
