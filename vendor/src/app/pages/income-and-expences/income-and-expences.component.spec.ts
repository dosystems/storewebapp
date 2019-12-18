import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeAndExpencesComponent } from './income-and-expences.component';

describe('IncomeAndExpencesComponent', () => {
  let component: IncomeAndExpencesComponent;
  let fixture: ComponentFixture<IncomeAndExpencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeAndExpencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeAndExpencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
