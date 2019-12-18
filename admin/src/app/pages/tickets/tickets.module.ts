import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TicketsComponent } from './tickets.component';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
export const routes = [
  { path: '', component: TicketsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DirectivesModule,
    TableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    TicketsComponent
    
  ]
})

export class TicketsModule { }
