import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { TableModule } from 'primeng/table';
import { DirectivesModule } from '../theme/directives/directives.module';
import { PipesModule } from '../theme/pipes/pipes.module';
import { routing } from './pages.routing';
import { PagesComponent } from './pages.component';
import { DropdownModule } from 'primeng/dropdown';
import { MenuComponent } from '../theme/components/menu/menu.component';
import { NavbarComponent } from '../theme/components/navbar/navbar.component';
import { MessagesComponent } from '../theme/components/messages/messages.component';
import { BreadcrumbComponent } from '../theme/components/breadcrumb/breadcrumb.component';
import { BackTopComponent } from '../theme/components/back-top/back-top.component';





@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    DirectivesModule,
    PipesModule,
    routing,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,

  ],
  declarations: [
    PagesComponent,
    MenuComponent,
    NavbarComponent,
    MessagesComponent,
    BreadcrumbComponent,
    BackTopComponent
    
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class PagesModule { }
