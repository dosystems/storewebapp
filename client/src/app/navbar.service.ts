import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NavbarService {

  // Observable string sources
  private componentMethodCallSource = new Subject<any>();

   // Observable string sources
   private componentMethodCallSource2 = new Subject<any>();

   // Observable string sources
   private componentMethodCallSourceCurrency = new Subject<any>();
  
  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();

  // Observable string streams
  componentMethodCalled2$ = this.componentMethodCallSource2.asObservable();


   // Observable string streams
   componentMethodCalledCurrency$ = this.componentMethodCallSourceCurrency.asObservable();
  // Service message commands
  callComponentMethod() {
    this.componentMethodCallSource.next();
  }

  callComponentMethod2() {
    this.componentMethodCallSource2.next();
  }


  callComponentMethodCalledCurrency() {
    this.componentMethodCallSourceCurrency.next();
  }



}