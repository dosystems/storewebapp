import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import '../../assets/js/countdown/jquery.countdown.min.js';
import '../../assets/js/ez-plus/jquery.ez-plus.js';
import * as $ from 'jquery';
import { AppConfig } from '../app.config';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarService } from "../navbar.service";
import * as moment from 'moment/moment';
@Component({
  selector: 'ross-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  images: any = [];
  productCategory: any = [];
  disabled: boolean = false;
  orderDetails: any = {};
  selectedColor: any;
  selectedSizeIndex: any = 0;
  showSize: boolean = false;
  showColor: boolean = false;
  SelectedItem: any;
  productId: any;
  productDetails: any;
  savePercentage: any;
  photoPath: any = this.appConfig.imageUrl + 'entity/';
  rates = [1, 2, 3, 4, 5];
  reviewsForm: FormGroup;
  reviews: any = {};
  submitted: boolean = false;
  showWriteReview: boolean = false;
  pages: any;
  allReviews: any = [];
  totalRecords: any;
  pageNumber: any = 1;
  currencyPrices = [{ USD: 120 }, { EUR: 30 }, { BUX: 10 }];
  constructor(fb: FormBuilder, public appConfig: AppConfig, public router: Router, public route: ActivatedRoute,
    public appService: AppService, public toastr: ToastrService, public NavService: NavbarService) {
    route.params.subscribe(params => {
      this.productId = params['id'];
      this.getProductDetailsById(this.productId);
      setTimeout(() => {
        this.onProductDetailsView();
      }, 1000);

    });

    this.reviewsForm = fb.group({
      title: ['', Validators.required],
      comment: ['', Validators.required],
      rating: ['', Validators.required]
    });
  }


  ngOnInit() {
    this.appConfig.loadCountDown();
    window.scroll(0, 0);
  }
  async ngAfterViewInit() {
    await setTimeout(() => {    //<<<---    using ()=> syntax
      this.loadProductPreview();
      this.appConfig.loadScript('../../assets/js/app.js');
    }, 1000);
  }

  // to select images 
  public selectImage(image: any, images?: any) {
    let newcolor: any = images;
    if (image) {
      image = encodeURI(image);
      this.SelectedItem = {
        id: 0,
        big: this.photoPath + 'l/' + image,
        small: this.photoPath + 's/' + image,
        title: "display title"
      };

      if (newcolor && newcolor.images.length > 0) {
        this.images = newcolor.images;
        this.selectedColor = newcolor.Color;
        // to get inventory of particular color
        this.orderDetails.inventory = this.productDetails.inventories.find(obj => {
          return obj.Color == this.selectedColor;
        })
        if (newcolor.images[0]) {
          newcolor.images[0] = encodeURI(newcolor.images[0]);
          this.SelectedItem = {
            id: 0,
            big: this.photoPath + 'l/' + newcolor.images[0],
            small: this.photoPath + 's/' + newcolor.images[0],
            title: "display title"
          };
        }

        $('.product-previews-carousel').slick('unslick');
        setTimeout(() => {
          this.loadProductPreview();
        }, 50);
      }

      $('.zoomWindowContainer div').stop().css("background-image", "url(" + this.SelectedItem.big + ")");

    } else {
      return false;
    }
  }

  // to load product preview
  loadProductPreview() {
    //$(".product-previews-carousel").not('.slick-initialized') in $(".slider").not('.slick-initialized').slick()
    // product previews carousel
    if ($(".product-previews-carousel").length) {
      var $this = $(".product-previews-carousel");
      $this.not('.slick-initialized').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        focusOnSelect: true,
        infinite: false
      });

      $this.on('click', '.slick-slide', function () {
        $('.zoom-link').removeClass('disable-gallery');
      })
    }
  }

  // to get product details by Id
  getProductDetailsById(id) {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', 'entities' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.productDetails = res.details;
        this.appService.loaderStatus('none');
        if (this.productDetails.images[0]) {
          this.images = this.productDetails.images[0].images;
          this.selectedColor = this.productDetails.images[0].Color;
        }
        this.productCategory = this.productDetails.multipleCategories;
        if (this.productDetails.multipleCategories && this.productDetails.multipleCategories[0] && this.productDetails.multipleCategories[0].indexOf('-') > -1) {
          this.productDetails.categoryDetails = this.productDetails.multipleCategories[0].replace("-", " / ");

          let releventcategory = this.productDetails.multipleCategories[0].split("-");
          if (releventcategory[0] && releventcategory[1]) {
            this.productDetails.releventCategory = releventcategory[0] + '-' + releventcategory[1];
          } else if (releventcategory[0]) {
            this.productDetails.releventCategory = releventcategory[0]
          }
        }
        if (this.productDetails.inventories[0]) {
          this.orderDetails.inventory = this.productDetails.inventories[0];
        }
        if (this.orderDetails.inventory.Price && this.orderDetails.inventory.MRP) {
          this.savePercentage = (((this.orderDetails.inventory.MRP - this.orderDetails.inventory.Price) / this.orderDetails.inventory.MRP) * 100).toFixed(2);
        }
        let keys = Object.keys(this.productDetails.inventories[0]);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] == 'Color') {
            this.showColor = true;
          }
          if (keys[i] == 'Size' && this.productDetails.inventories[0].Size != '') {
            this.showSize = true;
          }
        }
        this.orderDetails.quantity = 1;
        this.SelectedItem = {
          id: 0,
          big: this.photoPath + 'l/' + this.images[0],
          small: this.photoPath + 's/' + this.images[0],
          title: "display title"
        };
      } else if (res && res.errorCode) {
        this.productDetails = [];
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went Wrong');
      this.appService.loaderStatus('none');
    })
  }

  // add product to cart or Buy
  productAddToCartOrBuy(productDetails, orderDetails, type) {

    if (type == 'buy') {
      if (!localStorage.getItem('userToken')) {
        this.toastr.error('Please login to continue');
        return;
      }
    }
    let order: any = {};
    order.entityId = productDetails._id;
    if (productDetails && productDetails.address) {
      order.shippingFrom = productDetails.address;
    }
    if (orderDetails.quantity) {
      order.quantity = orderDetails.quantity;
    }
    if (orderDetails.inventory) {
      if (orderDetails.inventory.Available == 0) {
        this.toastr.warning('Out of stock');
        return;
      } else {
        order.inventory = orderDetails.inventory;

        // to display grand total for currencies
        if (order.inventory.Currency) {
          order.currencies = order.inventory.Currency;
        }
      }
    }
    this.disabled = true;

    // To add first category
    let categories = productDetails.multipleCategories;
    if (categories && categories.length && categories.length > 0) {
      let category = categories[0].split('-');
      order.category = category[0];
    }

    if (this.images && this.images.length > 0)
      order.images = this.images;
    if (type == 'buy') {
      order.status = this.appConfig.orderPaymentStatus;
    } else {
      order.status = "AddToCart";
    }

    if (order.inventory == {}) {
      return;
    } else {
      delete order.inventory.Available;
      delete order.inventory.Quantity;
      delete order.inventory.Hold;
      delete order.inventory.MRPCurrency;
      delete order.inventory.Currency;
      delete order.inventory.Price;
      delete order.inventory.MRP;
    }
    order.entityName = productDetails.name;
    if (!localStorage.getItem('userToken')) {
      this.saveOrdersInLocalStorage(order);
      return;
    }
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', 'orders', order).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204) {

        if (type == 'buy') {
          this.router.navigate(['/checkout']);
        } else {
          this.router.navigate(['/cart']);
          this.toastr.success('Product added to cart successfully');
        }
        this.disabled = false;
        this.NavService.callComponentMethod2();
        this.appService.loaderStatus('none');
      } else {
        this.disabled = false;
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.disabled = false;
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }


  // to  change price when quantity increase or decrease
  grandTotalChange(orderDetails, type) {
    if (orderDetails.inventory) {
      if (orderDetails.inventory.Available == 0) {
        // this.toastr.warning('Out of stock');
        return;
      }
    }
    let quantity;

    if (orderDetails.quantity) {
      quantity = orderDetails.quantity;
    }
    if (quantity) {
      if (type && type == 'decrease') {
        if (quantity == 1) {
          return;
        } else {
          quantity = quantity - 1;
        }
      } else if (type && type == 'increase') {
        if (orderDetails.quantity == orderDetails.inventory.Available) {
          this.toastr.warning('Required Amount of Quantity is not available');
          return;
        }
        quantity = quantity + 1;
      }
      orderDetails.quantity = quantity;
    }
  }


  // change size show available quantity, inventory
  changeSize(i) {
    this.selectedSizeIndex = i;
    this.orderDetails.inventory = this.productDetails.inventories[i];
  }

  // to save orders in local storage and update count in nabar
  saveOrdersInLocalStorage(order) {
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify([order]));
    } else if (localStorage.getItem('orders')) {
      let orders = JSON.parse(localStorage.getItem('orders'));
      let oldQuantity;
      if (orders && orders.length > 0) {
        for (var i = 0; i < orders.length; i++) {
          if (orders[i].entityId == order.entityId) {
            oldQuantity = orders[i].quantity;
            orders.splice(i, 1);
          }
        }
        if (oldQuantity) {
          order.quantity = order.quantity + oldQuantity;
        }
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
      }
    }
    this.router.navigate(['/cart']);
    this.toastr.success('Product Added To Cart Successfully');
    this.NavService.callComponentMethod2();
    return;

  }



  // to add product to WishList 
  addToWishList(productId) {
    this.disabled = false;
    if (!localStorage.getItem('userToken')) {
      this.toastr.warning('Please Login To Continue');
      return;
    }
    let fav: any = {};
    fav.entityId = productId;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', 'favorites', fav).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.toastr.success("Product Added to Wish List");
        this.appService.loaderStatus('none');
        this.getProductDetailsById(productId);
      } else {
        this.disabled = false;
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })
  }


  // to remove fav of product

  removeFromWishList(favId, productId) {
    if (!localStorage.getItem('userToken')) {
      this.toastr.warning('Please Login To Continue');
      return;
    }
    this.appService.manageHttp('delete', `favorites/${favId}`, '')
      .subscribe(res => {
        if (res && res.respCode && res.respCode === 206) {
          this.toastr.success("Product Removed from Wish List");
          this.getProductDetailsById(productId);
        } else {
          this.toastr.error(res.errorMessage);
        }
      }, (error) => {
        this.toastr.error(' something went wrong');
      });
  }



  // on rating submit
  onRatingSubmit(form) {
    if (!localStorage.getItem('userToken')) {
      this.toastr.warning('Please Login To Continue');
      return;
    }
    if (!form.valid) {
      this.submitted = true;
      return;
    }
    this.disabled = true;
    form.value.entityId = this.productId;
    if (form.value.title) form.value.title = this.appService.capitalize(form.value.title);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', 'reviews', form.value).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.toastr.success(res.respMessage);
        this.appService.loaderStatus('none');
        this.getProductDetailsById(this.productId);
        this.getAllReviews();
        this.reviewsForm.reset();
        this.submitted = false;
        this.showWriteReview = false;
        this.disabled = false;
      } else {
        this.disabled = false;
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })
  }

  // get all reviews
  getAllReviews() {
    let filterCriteria: any = { "page": this.pageNumber, "limit": this.appConfig.productsPerPage, "sortfield": "created", "direction": "desc" };
    filterCriteria.criteria = [];
    filterCriteria.criteria.push({ "key": "entityId", "value": this.productId, "type": "in" });
    var URL = 'reviews?filter=' + JSON.stringify(filterCriteria) + '';
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.reviews) {
        this.allReviews = res.reviews;
        for (let i = 0; i < this.allReviews.length; i++) {
          if (this.allReviews[i].created) {
            this.allReviews[i].created = moment(this.allReviews[i].created).format(this.appConfig.userFormat2);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
          this.pages = Math.ceil(this.totalRecords / this.appConfig.productsPerPage);
        }
        this.appService.loaderStatus('none');
      } else {
        this.allReviews = [];
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }


  // on page change
  paginate(event) {
    this.pageNumber = event.page + 1;
    this.getAllReviews();
  }




  // update review
  updateReview(reviewId) {
    let data: any = {};
    data.inappropriate = true;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'reviews/' + reviewId, data).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.appService.loaderStatus('none');
        this.getAllReviews();
      } else {
        this.disabled = false;
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })
  }



  // on product details page click
  onProductDetailsView() {
    let productData: any = {};
    if (this.productDetails) {
      productData.entityId = this.productDetails._id;
      productData.name = this.productDetails.name;
      if (this.orderDetails.inventory && this.orderDetails.inventory.Price)
        productData.price = this.orderDetails.inventory.Price;
      if (this.productDetails.rating && this.productDetails.rating.rating)
        productData.reviews = this.productDetails.rating.rating;
      if (this.productDetails && this.productDetails.images) {
        productData.images = this.productDetails.images;
      }
    }
    if (productData && (!productData.name && !productData.entityId && !productData.images))
      return;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', 'productClick', productData).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.appService.loaderStatus('none');
        this.getAllReviews();
      } else {
        this.disabled = false;
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })
  }




}
