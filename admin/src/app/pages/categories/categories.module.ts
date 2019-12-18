import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { AutoCompleteModule } from 'primeng/primeng';

import { CategoriesComponent } from './categories.component';

export const routes = [
  { path: '', component: CategoriesComponent, pathMatch: 'full' }
];


@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    RouterModule.forChild(routes),
    TableModule
  ],
  declarations: [CategoriesComponent]
})
export class CategoriesModule { }
