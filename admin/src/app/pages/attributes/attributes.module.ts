import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { AttributesComponent } from './attributes.component';
export const routes = [
  { path: '', component: AttributesComponent, pathMatch: 'full' }
]

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule
  ],
  declarations: [AttributesComponent]
})
export class AttributesModule { }
