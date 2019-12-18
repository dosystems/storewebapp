import { Component, Input } from '@angular/core';
import * as $ from 'jquery';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import * as moment from 'moment/moment';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'ross-products-by-categories',
  templateUrl: './products-by-categories.component.html',
  styleUrls: ['./products-by-categories.component.css']
})
export class ProductsByCategoriesComponent {
  @Input() category: any;
  @Input() productId: any;
  products: any = [];
  selectedCategory: any;
  detailsPage: boolean = false;
  constructor(public route: ActivatedRoute, public router: Router, public appConfig: AppConfig, public appService: AppService, public toastr: ToastrService) {
    route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.detailsPage = true;
      }
    });
  }
  ngOnInit() {
    this.getProductsByCategory(this.category, this.productId);
    let cat = this.category.split("-");
    if (cat[1]) {
      this.selectedCategory = cat[1].trim();
    } else if (cat[0]) {
      this.selectedCategory = cat[0].trim();
    }


  }
  // load Category Carousel
  loadCategoryCarousel(cat) {
    if ($(".deal-carousel-24." + cat) && $(".deal-carousel-24." + cat).slick()) {
      $('.deal-carousel-24.' + cat).slick('unslick');
    }

    if ($(".deal-carousel-24." + cat).length) {
      var $this = $(".deal-carousel-24." + cat),
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
  getProductsByCategory(search, productId?: any) {
    this.appService.loaderStatus('block');
    let filterCriteria = { "page": 1, "limit": this.appConfig.productsPerPage, "sortfield": "created", "direction": "desc" };


    if (search) {
      filterCriteria['globalSearch'] = { "value": search.trim(), "type": "user" };
    }
    let URL = 'entities' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', URL, '').subscribe(res => {

      if (res.entities && res.entities.length > 0) {
        this.products = res.entities;
        for (var i = 0; i < this.products.length; i++) {
          if (productId && productId == this.products[i]._id) {
            this.products.splice(i, 1);
          }
        }
        window.scrollTo(0, 0);
        this.products.forEach(product => {
          if (product.inventories && product.inventories[0] && product.inventories[0].Price) {
            product.price = product.inventories[0].Price;
          }
          if (product.inventories[0].Price && product.inventories[0].MRP) {
            product.savePercentage = (((product.inventories[0].MRP - product.inventories[0].Price) / product.inventories[0].MRP) * 100).toFixed(2);
            product.savePercentage = parseInt(product.savePercentage);
          }
          if (product.rating && product.rating.rating) {
            product.reviews = product.rating.rating;
          }
          product.showNewLabel = true;
          let showDate = moment(product.created).add(this.appConfig.showDaysOfNewLabel, 'day').format(this.appConfig.userFormat);
          let now = moment().format(this.appConfig.userFormat);
          if (now && showDate && now > showDate) {
            product.showNewLabel = false;
          }
          product.productId = product._id;
        });


        setTimeout(() => {    //<<<---    using ()=> syntax
          this.loadCategoryCarousel(this.selectedCategory);
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
