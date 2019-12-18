import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { MultiSelectModule } from 'primeng/components/multiselect/multiselect';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { MyDatePickerModule } from 'mydatepicker';

import { PromocodesComponent } from './promocodes.component';

export const routes = [
  { path: '', component: PromocodesComponent }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ReactiveFormsModule,
    DirectivesModule,
    MyDatePickerModule,
    DropdownModule,
    MultiSelectModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PromocodesComponent]
})

export class PromocodesModule { }
