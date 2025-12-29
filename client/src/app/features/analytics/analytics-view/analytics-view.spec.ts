import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsView } from './analytics-view';

describe('AnalyticsView', () => {
  let component: AnalyticsView;
  let fixture: ComponentFixture<AnalyticsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
