import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NavbarService {

  // Observable string sources
  private componentMethodCallSource = new Subject<any>();

  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();

  // Service message commands
  callComponentMethod() {
    this.componentMethodCallSource.next();
  }

}
