import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { DirectivesModule } from '../../theme/directives/directives.module';

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
    DirectivesModule,
    DropdownModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ReportsComponent]
})
export class ReportsModule { }
