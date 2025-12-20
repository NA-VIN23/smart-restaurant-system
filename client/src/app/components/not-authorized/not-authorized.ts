import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding:2rem; text-align:center"><h2>Not authorized</h2><p>You do not have permission to view this page.</p></div>`
})
export class NotAuthorizedComponent {}
