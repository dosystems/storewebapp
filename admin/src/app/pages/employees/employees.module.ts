import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { EmployeesComponent } from './employees.component';

export const routes = [
  { path: '', component: EmployeesComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      TableModule,
      DirectivesModule,
      DropdownModule,
      RouterModule.forChild(routes)
  ],
  declarations: [EmployeesComponent]
})

 export class EmployeesModule { }

