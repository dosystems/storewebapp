import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './activity.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DirectivesModule } from '../../theme/directives/directives.module'; 

export const routes = [
  { path:'',component:ActivityComponent,pathMatch:'full' }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DirectivesModule
  ],
  declarations: [ActivityComponent]
})
export class ActivityModule { }
