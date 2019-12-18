import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSettingsComponent } from './add-settings.component';

describe('AddSettingsComponent', () => {
  let component: AddSettingsComponent;
  let fixture: ComponentFixture<AddSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
