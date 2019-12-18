import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnouncementsComponent } from './anouncements.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '../../theme/directives/directives.module'; 

export const routes = [
  { path: '', component: AnouncementsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    TableModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  declarations: [AnouncementsComponent]
})
export class AnouncementsModule { }
