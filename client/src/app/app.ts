
import { Component } from '@angular/core';
<<<<<<< HEAD
import { RouterOutlet, provideRouter } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
import { HeaderComponent } from './components/header/header';
import { routes } from './app.routes';
=======
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
>>>>>>> origin/main

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, TableListComponent, HeaderComponent],
=======
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule
  ],
>>>>>>> origin/main
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Smart Restaurant';
<<<<<<< HEAD
}

// Provide router in bootstrap/main or here for standalone purposes
export const appProviders = [provideRouter(routes)];
=======

  constructor(public authService: AuthService, private router: Router) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
>>>>>>> origin/main
