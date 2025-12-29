import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api';

import { TableList } from './table-list';

describe('TableList', () => {
  let component: TableList;
  let fixture: ComponentFixture<TableList>;

  beforeEach(async () => {
    const apiStub = {
      get: (_path: string) => of([])
    };

    await TestBed.configureTestingModule({
      imports: [TableList],
      providers: [{ provide: ApiService, useValue: apiStub }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
