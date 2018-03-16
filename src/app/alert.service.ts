import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class AlertService {

  constructor(public snackbar: MatSnackBar) { }

  alert (message) {
    this.snackbar.open(message, 'X', {
      duration: 2000,
    });
  }

}
