import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { RadioButtonModule } from 'primeng/radiobutton';

import { NewsletterComponent } from './newsletter.component';

export const routes = [
  { path:'' , component:NewsletterComponent , pathMatch:'full' }
]

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    TableModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    RadioButtonModule  
  ],
  declarations: [NewsletterComponent]
})
export class NewsletterModule { }
