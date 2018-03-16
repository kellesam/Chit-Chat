import { Component, OnInit, OnChanges, AfterViewInit, ViewChildren, QueryList, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['../chat.component.css']
})
export class MessagesComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChildren('messages') messagesEl: QueryList<any>;

  messages: Observable<any>;
  @Output() changed: EventEmitter<any>;
  constructor (private _cs: ChatService) {
    this.messages = this._cs.getMessages();
  }

  ngOnInit() {

  }

  ngAfterViewInit () {
    this.messagesEl.changes.subscribe(
      (change) => {
        //console.log('EL CHANGE');
        //this.onChange();
      }
    );
  }

  onChange() {
    this.changed.emit(null);
  }

  ngOnChanges () {

  }

}
