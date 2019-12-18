import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { ToastrModule } from 'ngx-toastr';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { ErrorComponent } from './pages/error/error.component';
import { PipesModule } from './theme/pipes/pipes.module';

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDe_oVpi9eRSN99G4o6TwVjJbFBNr58NxE'
    }),
    HttpClientModule,
    ToastrModule.forRoot({ 
      timeOut: 2000,
    }),
    routing,
    PipesModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
