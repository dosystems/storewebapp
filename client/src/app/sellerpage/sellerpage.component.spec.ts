import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerpageComponent } from './sellerpage.component';

describe('SellerpageComponent', () => {
  let component: SellerpageComponent;
  let fixture: ComponentFixture<SellerpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellerpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
