import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// The class name must be 'AppComponent'
export class AppComponent {
  title = 'Smart Restaurant';
}