import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import {TranslateModule} from 'ng2-translate';

@NgModule({
  imports: [
    HttpModule,
    CommonModule,
    TranslateModule,
  ],
  exports: [
    CommonModule,
    TranslateModule
  ]
})
export class SharedLazyModule {}
