import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './table-card.html',
  styleUrls: ['./table-card.scss'],
})
export class TableCard {
  @Input() table: any | null = null;
  @Output() onJoin = new EventEmitter<any>();

  join() {
    this.onJoin.emit(this.table);
  }
}
