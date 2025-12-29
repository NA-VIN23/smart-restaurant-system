import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-analytics-view',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './analytics-view.html',
  styleUrls: ['./analytics-view.scss'],
})
export class AnalyticsView {}
