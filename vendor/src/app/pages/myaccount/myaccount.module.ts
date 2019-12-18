import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyaccountComponent } from './myaccount.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { DropdownModule } from 'primeng/dropdown';

export const routes = [
  { path: '', component: MyaccountComponent, pathMatch: 'full' }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    DirectivesModule,
    DropdownModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyaccountComponent]
})
export class MyaccountModule { }
