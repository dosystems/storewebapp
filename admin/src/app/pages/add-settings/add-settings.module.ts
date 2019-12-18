import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/primeng';
import { MultiSelectModule } from 'primeng/multiselect';

import { AddSettingsComponent } from './add-settings.component';
export const routes = [
  { path: '', component: AddSettingsComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    RouterModule.forChild(routes),
    MultiSelectModule
  ],
  declarations: [AddSettingsComponent]
})
export class AddSettingsModule { }
