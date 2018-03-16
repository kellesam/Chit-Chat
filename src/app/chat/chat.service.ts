import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable, Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class ChatService {

  username: String   = "";
  room:     String   = "";
  users = [];
  userCount = 0;
  messages = [];

  private _userCount = new Subject<any>();
  private _users = new Subject<any>();
  private _messages = new Subject<any>();

  constructor(private _ss: SocketService, private _route: ActivatedRoute) {

    this._ss.response().subscribe( response => {
      this.handleResponse(response);
    });

  }

  handleResponse (response) {

    switch (response.type) {

      case 'user-joined':
        this.users = [];
        this.userCount = 0;
        response.room_info.users.forEach( user => {
          this.users.push(user);
          this.userCount++;
        });
        this._userCount.next(this.userCount);
        this._users.next(this.users);
        this.messages.push(response);
        this._messages.next(this.messages);
        break;

      case 'user-disconnect':
          this.users.splice(this.users.indexOf(response.username), 1);
          this.userCount--;
          this._userCount.next(this.userCount);
          this._users.next(this.users);
          this.messages.push(response);
          this._messages.next(this.messages);
          break;

      case 'user-message':
        this.messages.push(response);
        this._messages.next(this.messages);
        break;

      default:
        break;
    }

  }

  event (type, content?) {
    return {
      type      : type,
      content   : content || null,
      room      : this.room,
      username  : this.username,
      timeStamp : new Date()
    }
  }

  join () {
    this._ss.send(this.event('user-joined'));
  }

  send (message) {
    this._ss.send(this.event('user-message', message));
  }

  setupChat (details) {
    this.username = details.username;
    this.room = details.room;
  }

  setRoom (room: String) {
    this.room = room;
  }

  getRoom () {
    return this.room;
  }

  getUsers () {
    return this._users.asObservable();
  }
  getUserCount () {
    return this._userCount.asObservable();
  }
  getMessages () {
    return this._messages.asObservable();
  }

}
