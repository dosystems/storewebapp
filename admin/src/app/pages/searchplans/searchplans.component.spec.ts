import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchplansComponent } from './searchplans.component';

describe('SearchplansComponent', () => {
  let component: SearchplansComponent;
  let fixture: ComponentFixture<SearchplansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchplansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
