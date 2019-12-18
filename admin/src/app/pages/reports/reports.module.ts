import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { RatingModule } from 'primeng/rating';
import { AutoCompleteModule } from 'primeng/primeng';

import { ReportsComponent } from './reports.component';

export const routes: Routes = [
  {
    path: '', component: ReportsComponent
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DropdownModule,
    DirectivesModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule
  ],
  declarations: [ReportsComponent]
})
export class ReportsModule { }
