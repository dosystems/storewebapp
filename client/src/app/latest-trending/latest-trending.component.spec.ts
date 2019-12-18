import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestTrendingComponent } from './latest-trending.component';

describe('LatestTrendingComponent', () => {
  let component: LatestTrendingComponent;
  let fixture: ComponentFixture<LatestTrendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestTrendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestTrendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
