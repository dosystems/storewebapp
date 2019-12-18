import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/primeng';
import {AddProductComponent} from './add-product.component';
import { MyDatePickerModule } from 'mydatepicker';
import { ImageUploadModule } from "angular2-image-upload";
export const routes = [
  { path: '', component: AddProductComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    RouterModule.forChild(routes),
    MyDatePickerModule,
    ImageUploadModule.forRoot()
  ],
  declarations: [AddProductComponent]
})
export class AddProductModule { }
