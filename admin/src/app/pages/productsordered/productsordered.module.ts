import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';

import { ProductsorderedComponent } from './productsordered.component';
export const routes = [
  { path:'' , component:ProductsorderedComponent , pathMatch:'full' }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DropdownModule,
    DirectivesModule
  ],
  declarations: [ProductsorderedComponent]
})
export class ProductsorderedModule { }
