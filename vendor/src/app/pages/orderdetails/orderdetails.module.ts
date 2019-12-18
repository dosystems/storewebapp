import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderdetailsComponent } from './orderdetails.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';

import { DirectivesModule } from '../../theme/directives/directives.module';


export const routes = [
  { path: '', component: OrderdetailsComponent, pathMatch: 'full' }
];
 
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DirectivesModule,
    TableModule,
    DropdownModule
  ],
  declarations: [OrderdetailsComponent]
})
export class OrderdetailsModule { }
