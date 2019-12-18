import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeratesComponent } from './exchangerates.component';

describe('ExchangeratesComponent', () => {
  let component: ExchangeratesComponent;
  let fixture: ComponentFixture<ExchangeratesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeratesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeratesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
