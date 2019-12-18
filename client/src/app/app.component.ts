import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import $ from "../assets/js/jquery.min.js"
import '../assets/js/slick/slick.min.js';
import '../assets/js/megamenu.min.js';
import '../assets/js/app.js';

@Component({
  selector: 'ross-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'ross';
  constructor(private router: Router) { 
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
          this.router.navigated = false;
          window.scrollTo(0, 0);
      }
    });
  }

    ngOnInit() {
      window.scrollTo(0, 0);
    }
}
