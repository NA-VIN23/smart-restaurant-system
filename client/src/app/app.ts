import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget';
import { NavbarComponent } from './components/navbar/navbar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ChatWidgetComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
    <app-chat-widget></app-chat-widget>
  `,
  styles: [`
    .content {
      min-height: calc(100vh - 70px);
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) { }
}