import { Injectable } from '@angular/core';
import { menuItems } from './menu';

@Injectable()
export class MenuService {

  public getMenuItems():Array<Object> {
    return menuItems;
  }
 
}
