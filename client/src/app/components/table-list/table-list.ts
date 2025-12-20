import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for the loop (*ngFor)
import { ApiService } from '../../services/api'; // Connecting to your Backend
import { RestaurantTable } from '../../models/types'; // Using your Contract

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [CommonModule], // <--- Must include this to use *ngFor in HTML
  templateUrl: './table-list.html',
  styleUrls: ['./table-list.css']
})
export class TableListComponent implements OnInit {
  tables: RestaurantTable[] = []; // Store the data here

  // Inject the API Service
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  // This runs automatically when the page loads
  ngOnInit() {
    this.api.getTables().subscribe({
      next: (data) => {
        this.tables = data; // Save the data from the server
        console.log('Tables loaded:', data);
        this.cdr.detectChanges(); // Manually force update
      },
      error: (err) => console.error('Error loading tables:', err)
    });
  }

  trackById(index: number, item: RestaurantTable) {
    return item.id;
  }
}