import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card style="max-width:600px;margin:24px auto;padding:16px;">
      <h2>Not Authorized</h2>
      <p>You do not have permission to view this page.</p>
    </mat-card>
  `
})
export class NotAuthorized {}
