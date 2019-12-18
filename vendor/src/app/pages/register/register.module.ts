import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CaptchaModule } from 'primeng/captcha';
import { DropdownModule } from 'primeng/dropdown';


import { RegisterComponent } from './register.component';

export const routes = [
  { path: '', component: RegisterComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    CaptchaModule,
    DropdownModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RegisterComponent]
})

export class RegisterModule { }
