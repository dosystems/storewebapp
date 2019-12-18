import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../navbar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../app.config';
@Component({
  selector: 'ross-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  constructor( public appConfig:AppConfig, public NavService:NavbarService, public router:Router) { }

  ngOnInit() {
  }
   // to search products in global search
   SearchProducts(event?: any) {
    if (!(this.router.url === '/products')) {
      this.router.navigate(['/products']);
    }
    localStorage.setItem('Search', event);
    this.NavService.callComponentMethod2();
  }

}
