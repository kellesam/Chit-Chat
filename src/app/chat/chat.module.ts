import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ChatRoutingModule } from './chat-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MessagesComponent } from './messages/messages.component';
import { InputComponent } from './input/input.component';
import { NameDialog } from './chat.component';
import { SocketService } from './socket.service';
import { ChatService } from './chat.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatCardModule
  ],
  declarations: [
    NameDialog,
    SidebarComponent,
    MessagesComponent,
    InputComponent
  ],
  entryComponents: [
    NameDialog
  ],
  exports: [
    SidebarComponent,
    MessagesComponent,
    InputComponent
  ],
  providers: [
    SocketService,
    ChatService,
  ]
})
export class ChatModule { }
