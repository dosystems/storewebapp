import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsorderedComponent } from './productsordered.component';

describe('ProductsorderedComponent', () => {
  let component: ProductsorderedComponent;
  let fixture: ComponentFixture<ProductsorderedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsorderedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsorderedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
