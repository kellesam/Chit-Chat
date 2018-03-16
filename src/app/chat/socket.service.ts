import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as Rx from 'rxjs/Rx';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private _socket;
  private _response = new Subject<any>();

  constructor () {

    this._socket = io();
    this._socket.on('event', data => {
      this._response.next(data);
    });

  }

  send (payload) {

    this._socket.emit('event', payload);

  }

  response () {

    return this._response.asObservable();

  }

}
