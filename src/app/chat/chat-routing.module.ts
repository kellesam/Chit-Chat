import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat.component';

const routes: Routes = [
  { path: 'chat', redirectTo: '/', pathMatch: 'full' },
  { path: 'chat/:room', component: ChatComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})

export class ChatRoutingModule { }
