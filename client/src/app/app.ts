import { Component } from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
import { HeaderComponent } from './components/header/header';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableListComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// The class name must be 'AppComponent'
export class AppComponent {
  title = 'Smart Restaurant';
}

// Provide router in bootstrap/main or here for standalone purposes
export const appProviders = [provideRouter(routes)];