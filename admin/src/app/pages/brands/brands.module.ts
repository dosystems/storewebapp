import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { BrandsComponent } from './brands.component';
import { ImageUploadModule } from "angular2-image-upload";


export const routes = [
  { path:'' , component:BrandsComponent , pathMatch:'full' }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    DropdownModule,
    AutoCompleteModule,
    ChipsModule,
     ImageUploadModule.forRoot()  
  ],
  declarations: [BrandsComponent]
})
export class BrandsModule { }
