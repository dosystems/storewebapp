import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeAndExpencesComponent } from './income-and-expences.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const routes = [
  { path: '', component: IncomeAndExpencesComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    FormsModule,
    ReactiveFormsModule
  ],
  
  declarations: [IncomeAndExpencesComponent]
})
export class IncomeAndExpencesModule { }
