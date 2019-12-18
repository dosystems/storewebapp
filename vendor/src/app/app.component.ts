import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from "./app.service";
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'az-root',
  encapsulation: ViewEncapsulation.None,
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  currentUrl: any;

  constructor(router: Router, public appService: AppService) {
    this.currentUrl = window.location.href;
    this.currentUrl = this.currentUrl.split('/');
    
    appService.getLocalStorageData();    
    if (this.currentUrl) {
      if ((this.currentUrl.indexOf('changerecoverpassword') > -1) || (this.currentUrl.indexOf('forgotpassword') > -1) || (this.currentUrl.indexOf('registration') > -1) || (this.currentUrl.indexOf('activateEmail') > -1) 
           || (this.currentUrl.indexOf('resetPassword') > -1) ) {
        return;
      } else {
        if ((appService.token === '') || (appService.token === null) || (appService.token === undefined)) {
          router.navigate(['/']);
        }
      }
    }
  }

}
