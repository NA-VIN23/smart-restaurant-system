import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ManagerDashboard } from './manager-dashboard';
import { TableService } from '../../../core/services/table.service';
import { QueueService } from '../../../core/services/queue.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('ManagerDashboard', () => {
  let component: ManagerDashboard;
  let fixture: ComponentFixture<ManagerDashboard>;

  beforeEach(async () => {
    const tableStub = {
      list: () => of([{ id: 1, table_number: '1', status: 'Reserved', current_customer_name: 'Alice' }]),
      vacate: (_id: number) => of(null)
    };

    const queueStub = {
      seat: (_id: number) => of(null)
    };

    const notifyStub = {
      success: (_m: string) => {},
      error: (_m: string) => {}
    };

      await TestBed.configureTestingModule({
        imports: [ManagerDashboard],
        providers: [
          { provide: TableService, useValue: tableStub },
          { provide: QueueService, useValue: queueStub },
          { provide: NotificationService, useValue: notifyStub }
        ]
      }).compileComponents();

    fixture = TestBed.createComponent(ManagerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seat and vacate a table', () => {
    const table = { id: 1, table_number: '1', status: 'Reserved' } as any;
    const ts = TestBed.inject(TableService) as any;
    const qs = TestBed.inject(QueueService) as any;

    let seatCalled = false;
    qs.seat = (_id: number) => {
      seatCalled = true;
      return of(null);
    };

    let vacateCalled = false;
    ts.vacate = (_id: number) => {
      vacateCalled = true;
      return of(null);
    };

    component.seat(table);
    expect(seatCalled).toBe(true);

    // simulate occupied state and vacate
    table.status = 'Occupied';
    component.vacate(table);
    expect(vacateCalled).toBe(true);
  });
});
