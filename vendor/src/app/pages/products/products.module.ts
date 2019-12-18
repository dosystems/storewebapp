import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/primeng';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { ProductsComponent } from './products.component';

export const routes = [
  { path: '', component: ProductsComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DirectivesModule,
    DropdownModule,
    AutoCompleteModule,
    RouterModule.forChild(routes)
],
  declarations: [ProductsComponent]
})
export class ProductsModule { }
