import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/primeng';
import { AddNewProductComponent } from './add-new-product.component';
import { MyDatePickerModule } from 'mydatepicker';
import { ImageUploadModule } from "angular2-image-upload";
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';

export const routes = [
  { path: '', component: AddNewProductComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    RouterModule.forChild(routes),
    MyDatePickerModule,
    ImageUploadModule.forRoot(),
    MultiSelectModule,
    CheckboxModule
  ],
  declarations: [AddNewProductComponent]
})
export class AddNewProductModule { }