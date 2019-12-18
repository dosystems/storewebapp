import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';

import { SettingsComponent } from './settings.component';

export const routes = [
  { path:'' , component: SettingsComponent , pathMatch:'full' }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DropdownModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    MultiSelectModule
  ],
  declarations: [SettingsComponent]
})
export class SettingsModule { }
