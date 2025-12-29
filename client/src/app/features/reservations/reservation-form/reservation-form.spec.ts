import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReservationService } from '../../../core/services/reservation.service';
import { TableService } from '../../../core/services/table.service';
import { NotificationService } from '../../../core/services/notification.service';

import { ReservationForm } from '../../reservation/reservation-form/reservation-form';

describe('ReservationForm', () => {
  let component: ReservationForm;
  let fixture: ComponentFixture<ReservationForm>;

  beforeEach(async () => {
    const tableStub = { list: () => of([]) };
    const svcStub = { create: (_p: any) => of(null) };
    const notifyStub = { success: (_m: string) => {}, error: (_m: string) => {} };

    await TestBed.configureTestingModule({
      imports: [ReservationForm],
      providers: [
        { provide: ReservationService, useValue: svcStub },
        { provide: TableService, useValue: tableStub },
        { provide: NotificationService, useValue: notifyStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
