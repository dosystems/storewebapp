import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MywishlistComponent } from './mywishlist.component';

describe('MywishlistComponent', () => {
  let component: MywishlistComponent;
  let fixture: ComponentFixture<MywishlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MywishlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MywishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
