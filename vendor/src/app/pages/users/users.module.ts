import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';

import { UsersComponent } from './users.component';

export const routes = [
  { path:'' , component:UsersComponent , pathMatch:'full' }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DirectivesModule,
    DropdownModule
  ],
  declarations: [UsersComponent]
})
export class UsersModule { }
