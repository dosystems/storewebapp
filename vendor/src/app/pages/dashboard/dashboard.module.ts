import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { DashboardComponent } from './dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { TableModule } from 'primeng/table';
import 'chart.js/dist/Chart.js';
import { PieChartComponent } from './pie-chart/pie-chart.component';
export const routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChartsModule,
    DirectivesModule,
    PipesModule,
    TableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DashboardComponent,
    PieChartComponent
  ]
})

export class DashboardModule { }
