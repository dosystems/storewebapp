import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularProductsComponent } from './popular-products.component';

describe('PopularProductsComponent', () => {
  let component: PopularProductsComponent;
  let fixture: ComponentFixture<PopularProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopularProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopularProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
