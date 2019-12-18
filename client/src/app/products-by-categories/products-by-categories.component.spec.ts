import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsByCategoriesComponent } from './products-by-categories.component';

describe('ProductsByCategoriesComponent', () => {
  let component: ProductsByCategoriesComponent;
  let fixture: ComponentFixture<ProductsByCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsByCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsByCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
