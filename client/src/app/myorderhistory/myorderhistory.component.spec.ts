import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyorderhistoryComponent } from './myorderhistory.component';

describe('MyorderhistoryComponent', () => {
  let component: MyorderhistoryComponent;
  let fixture: ComponentFixture<MyorderhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyorderhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyorderhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
