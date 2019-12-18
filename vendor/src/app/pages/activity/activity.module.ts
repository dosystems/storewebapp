import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './activity.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';

export const routes = [
  { path:'',component:ActivityComponent,pathMatch:'full' }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule
  ],
  declarations: [ActivityComponent]
})
export class ActivityModule { }
