import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyaddressessComponent } from './myaddressess.component';

describe('MyaddressessComponent', () => {
  let component: MyaddressessComponent;
  let fixture: ComponentFixture<MyaddressessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyaddressessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyaddressessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
