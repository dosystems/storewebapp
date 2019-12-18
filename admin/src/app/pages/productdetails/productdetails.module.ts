import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/primeng';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { RatingModule } from 'primeng/rating';

import { ProductdetailsComponent } from './productdetails.component';
export const routes = [
  { path: '', component: ProductdetailsComponent, pathMatch: 'full' }
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
    RouterModule.forChild(routes),
    RatingModule
  ],
  declarations: [ProductdetailsComponent]
})
export class ProductdetailsModule { }
