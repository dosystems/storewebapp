import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import * as $ from 'jquery';
import * as moment from 'moment/moment';
@Component({
  selector: 'ross-popular-products',
  templateUrl: './popular-products.component.html',
  styleUrls: ['./popular-products.component.css']
})
export class PopularProductsComponent {

  products: any = [];
  constructor(public appConfig: AppConfig, public appService: AppService, public toastr: ToastrService) {
    this.getAllPopularProducts();
  }

  // load deal carousel
  loadDealCarouselPopular() {
    if ($(".deal-carousel-23").length) {
      var $this = $(".deal-carousel-23"),
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
  getAllPopularProducts() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', 'entities/popularProducts?filter={"limit": ' + this.appConfig.productsPerPage + '}', '').subscribe(res => {
      if (res.products && res.products.length > 0) {
        this.products = res.products;
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
          this.loadDealCarouselPopular();
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
