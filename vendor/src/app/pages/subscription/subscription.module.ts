import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';

import { SubscriptionComponent } from './subscription.component';

export const routes: Routes = [
  {
    path: '', component: SubscriptionComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DirectivesModule,
    DropdownModule
  ],
  declarations: [SubscriptionComponent]
})
export class SubscriptionModule { }
