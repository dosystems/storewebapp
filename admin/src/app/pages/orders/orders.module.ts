import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';

import { OrdersComponent } from './orders.component';

export const routes = [
  { path: '', component: OrdersComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    TableModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DropdownModule
  ],
  declarations: [OrdersComponent]
})
export class OrdersModule { }
