import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangepasswordComponent } from './changepassword.component';

export const routes = [
  { path: '', component: ChangepasswordComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

  ],
  declarations: [ChangepasswordComponent]
})
export class ChangepasswordModule { }
