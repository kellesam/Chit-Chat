import { Component, OnInit } from '@angular/core';

import { ChatService } from '../chat.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['../chat.component.css']
})
export class InputComponent implements OnInit {

  constructor(private _cs: ChatService) { }

  ngOnInit() {
  }

  onSend(message) {
    if (message !== null && !message.match(/^\s*$/)) {
      this._cs.send(message);
    }
  }

}
