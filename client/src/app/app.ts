import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { AuthService } from './core/services/auth';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorClass } from './core/interceptors/auth-interceptor-class';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorClass, multi: true }
  ]
})
export class App implements OnInit {
  protected readonly title = signal('client');

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // If there's a token, attempt to load the profile so UI reflects logged-in state on refresh
    if (localStorage.getItem('token')) {
      // fire-and-forget; components can react to auth.user
      this.auth.loadProfile().subscribe({ error: () => { /* ignore */ } });
    }
  }
}
