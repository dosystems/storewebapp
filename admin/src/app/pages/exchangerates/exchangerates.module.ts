import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { RatingModule } from 'primeng/rating';

import { ExchangeratesComponent } from './exchangerates.component';
export const routes: Routes = [
  {
    path: '', component: ExchangeratesComponent
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DropdownModule,
    DirectivesModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule    
  ],
  declarations: [ExchangeratesComponent]
})
export class ExchangeratesModule { }
