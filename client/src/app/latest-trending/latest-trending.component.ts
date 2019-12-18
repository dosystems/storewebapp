import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import * as moment from 'moment/moment';
import * as $ from 'jquery';
@Component({
  selector: 'ross-latest-trending',
  templateUrl: './latest-trending.component.html',
  styleUrls: ['./latest-trending.component.css']
})
export class LatestTrendingComponent {
  products: any = [];
  constructor(public appConfig: AppConfig, public appService: AppService, public toastr: ToastrService) {
    this.getAllRecentlyViewedProducts();
  }
  // load deal carousel
  loadDealCarousel2() {
    if ($(".deal-carousel-22").length) {
      var $this = $(".deal-carousel-22"),
        arrowsplace = $this;

      var $carouseltitle = $this.prev('.title');

      if ($this.parent().hasClass('collapsed-content')) {
        $carouseltitle = $this.parent().prev('.title');
      }
      if ($carouseltitle.find('.carousel-arrows').length) {
        arrowsplace = $carouseltitle.find('.carousel-arrows');
      }
      $this.slick({
        rows: 1,
        appendArrows: arrowsplace,
        slidesToShow: 7,
        slidesToScroll: 1,
        speed: 500,
        infinite: false,
        swipe: false,
        responsive: [{
          breakpoint: 993,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1
          }
        }, {
          breakpoint: 481,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        }]
      });
    }
  }



  //For Getting All the Products 
  getAllRecentlyViewedProducts() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', 'productClick/recentlyViewed?filter={"limit": ' + this.appConfig.productsPerPage + '}', '').subscribe(res => {
      if (res.productClicks && res.productClicks.length > 0) {
        this.products = res.productClicks;
        this.products.forEach(product => {
          product.productId = product._id;
          product.showNewLabel = true;
          let showDate = moment(product.created).add(this.appConfig.showDaysOfNewLabel, 'day').format(this.appConfig.userFormat);
          let now = moment().format(this.appConfig.userFormat);
          if (now && showDate && now > showDate) {
            product.showNewLabel = false;
          }
          if (product.inventories[0].Price && product.inventories[0].MRP) {
            product.savePercentage = (((product.inventories[0].MRP - product.inventories[0].Price) / product.inventories[0].MRP) * 100).toFixed(2);
            product.savePercentage = parseInt(product.savePercentage);
          }

        });
        setTimeout(() => {    //<<<---    using ()=> syntax
          this.loadDealCarousel2();
        }, 500);
        this.appService.loaderStatus('none');
      } else {
        this.products = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.products = [];
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }
}
