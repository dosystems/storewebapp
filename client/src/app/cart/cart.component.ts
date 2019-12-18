import { Component,OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import { AppService } from '../app.service';
import { Router,NavigationEnd } from '@angular/router';
import * as moment from 'moment/moment';
import { NavbarService } from '../navbar.service';
declare var $;
@Component({
  selector: 'ross-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  totalRecords: any;
  orders: any = [];
  orderId: any;
  grandTotal: any;
  pageNumber: any = 1;
  disabled: any;
  pages: any;
  noOrders: boolean = false;
  pageType: any = 'Cart';
  shipmentAddress: any = {};
  orderFailedErrorMesage: any = '';
  disableButton: Boolean = false;
  paymentMessage: any = false;
  orderQuantity: any;
  orderDetails: any = {};
  grandTotal2:any=0;
  grandTotalBux:Number=0;
  quantities=[1,2,3,4,5,6,7,8,9,10];
  releventCategory:any;
  productId:any;
  cartCount:any=0;
  constructor(public NavbarService: NavbarService, public router: Router, public appService: AppService, public appConfig: AppConfig, public toasterService: ToastrService) {
    window.scroll(0, 0);
    this.NavbarService.componentMethodCalledCurrency$.subscribe(
      () => {
        if (this.router.url == '/cart') {
        this.getAllOrders();
        }
      }
    );
    this.cartCount=0;
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        if (this.router.url == '/cart') {
         this.cartCount=this.cartCount+1;
          if (this.cartCount==1) {
            this.getAllOrders();
          }
          this.router.navigated = false;
          window.scrollTo(0, 0);
        }
      }
    });
    if (this.router.url == '/place-order') {
      this.pageType = 'placeOrder';
    }
    
  }

  ngOnInit(){
    this.getAllOrders();
  }

  // to get all products added to cart
  getAllOrders() {
    this.grandTotal = 0;
    this.grandTotalBux=0;
    this.appService.loaderStatus('block');
    var URL = 'Orders?filter={"page": "' + this.pageNumber + '", "limit": "' + this.appConfig.ordersPerPage + '","sortfield":"created","direction":"desc","criteria":[{ "key": "userId", "value": "' + this.appService.loginEmpDetails._id + '","type": "in" },{ "key": "status", "value": "AddToCart", "type": "regexOr"}]}';
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.totalQuantity) {
         // To update count in navbar
      }
      if (res && res.orders && res.orders.length > 0) {
        this.orders = res.orders;
       this.productId= this.orders[this.orders.length-1].entityId;
        let releventcategory=this.orders[this.orders.length-1].multipleCategories.split("-");
        if(releventcategory[0]&&releventcategory[1]){
          this.releventCategory=releventcategory[0]+'-'+releventcategory[1];
        }else if(releventcategory[0]){
          this.releventCategory=releventcategory[0];
        }
        this.orders.forEach(order => {
          this.grandTotalChange(order)
          if (order.created) {
            order.created = moment(order.created).format(this.appConfig.userFormat);
          }
          if (order.shipmentAddress && this.pageType === 'placeOrder') {
            this.shipmentAddress = order.shipmentAddress;
          }
        });
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
          this.pages = Math.ceil(this.totalRecords / this.appConfig.ordersPerPage);
        }

        this.appService.loaderStatus('none');
      } else {
        this.orders = [];
        this.noOrders = true;
        this.appService.loaderStatus('none');
      }

      this.getlocalStorageOrders();
      this.NavbarService.callComponentMethod2();
    }, (error) => {
      this.orders = [];
      this.toasterService.error('something went  wrong');
      this.appService.loaderStatus('none');
    })
  }

  // To place order for all available items in cart
  placeOrderForAllItemsInCart() {
    let itemsInCart = this.orders.map(order => ({ 'orderId': order._id }));
    let orderDetails: any = {};
    orderDetails.orders = itemsInCart;
    orderDetails.totalPrice = this.grandTotal;

    this.appService.loaderStatus('block');
    this.disableButton = true;
    this.appService.manageHttp('put', `orders/updateOrderPayment`, orderDetails)
      .subscribe(res => {
        if (res && res.length && res.length > 0) {
          // To clear previous order messages
          let orderMessageIndex = this.orders.findIndex(order => order.message);
          if (orderMessageIndex >= 0) {
            this.orders[orderMessageIndex].message = '';
          }
          let paymentSuccess = false;
          let paymetnSuccessMessage;
          res.forEach((response) => {
            if (response.response) {
              if (response.orderId) {
                let orderIndex = this.orders.findIndex(order => order._id == response.orderId)
                if (orderIndex >= 0) {
                  if (response.response.errorMessage) {
                    this.orders[orderIndex].message = response.response.errorMessage;
                  } else {
                    this.orders[orderIndex].message = '';
                  }
                }
              } else if (response.response.errorMessage) {
                this.toasterService.error(response.response.errorMessage);
                return;
              } else if (response.response.respMessage) {
                paymetnSuccessMessage = response.response.respMessage;
                return paymentSuccess = true;
              }
            }
          });
          if (paymentSuccess) {
            this.paymentMessage = true;
            this.NavbarService.callComponentMethod2();
          }
          this.appService.loaderStatus('none');
          this.disableButton = false;
        } else {
          this.toasterService.error('Try again later');
          this.appService.loaderStatus('none');
          this.disableButton = false;
        }
      }, (error) => {
        this.toasterService.error('Something Went Wrong');
        this.appService.loaderStatus('none');
        this.disableButton = false;
      });
  }

  // on page change
  paginate(event) {
    this.pageNumber = event.page + 1;
    this.getAllOrders();
  }

  grandTotalChange(order, type?: any) {
    let quantity;
    quantity = order.quantity;

    if (quantity) {
      if (type) {
        if (type == 'decrease') {
          if (quantity == 1) {
            return;
          } else {
            quantity = quantity - 1;
          }
        } else if (type == 'increase') {
          quantity = quantity + 1;
        }
        this.updateOrderQuantity(order, quantity);
      }
      // order.subtotal = Number(order.inventory.Price) * Number(quantity);

     // to display grand total for currencies
     if(order.currencies){
      order.currencies.filter(c=>{
        let price=c[this.appService.selectedCurrency.name];
        if(price){
          order.subtotal2 = Number(price) * Number(quantity);
        }
      });

      order.currencies.filter(c=>{
        let priceBux=c[this.appService.buxCurrency];
        if(priceBux){
          order.subtotalBux = Number(priceBux) * Number(quantity);
        }
      });
    }
      this.grandTotal = 0;
      this.grandTotal2 = 0;
      this.grandTotalBux = 0;
      this.orders.forEach(singleOrder => {
        // this.grandTotal = Number(this.grandTotal) + Number(singleOrder.subtotal);
         // to display grand total for currencies
        this.grandTotal2 = Number(this.grandTotal2) + Number(singleOrder.subtotal2);
        this.grandTotalBux = Number(this.grandTotalBux) + Number(singleOrder.subtotalBux);
      });
    }
  }

  // To update order quantity
  updateOrderQuantity(order, quantity) {
    quantity=Number(quantity);
    if(order&&quantity){
      var orders=this.orders;
    if (!localStorage.getItem('userToken')) {
      if (orders.length > 0) {
        for( var i=0;i<orders.length;i++){
          if(orders[i].entityId==order.entityId){
            orders[i].quantity=quantity;
          }
        }
        localStorage.removeItem('orders');
        localStorage.setItem('orders', JSON.stringify(orders));
      }
      this.getAllOrders();
      return;
    }

    var orderDetails = { quantity: quantity };
    this.appService.loaderStatus('block');
    this.disableButton = true;
    this.appService.manageHttp('put', `orders/${order._id}?response=true`, orderDetails)
      .subscribe(res => {
        if (res && res.respCode && res.respCode === 205) {
          if (res.details && res.details.quantity) {
            this.getAllOrders();
          }
        } else {
          this.toasterService.error(res.errorMessage);
        }
        this.appService.loaderStatus('none');
        this.disableButton = false;
      }, (error) => {
        this.disableButton = false;
        this.toasterService.error('Something Went Wrong');
        this.appService.loaderStatus('none');
      });
    }else{
      return;
    }
    
  }

  // to open delete order pop up
  showDeleteModel(orderId) {
    this.orderId = orderId;
    $('#deleteOrder').appendTo("body").modal('show');
  }

  // to delete order
  deleteOrder(orderId,type?:any) {
    if (!localStorage.getItem('userToken')) {
      if (this.orders.length > 0) {
        var index = this.orders.findIndex(function (o) {
          return o._id == orderId;
        })
        if (index !== -1) this.orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(this.orders));
        this.NavbarService.callComponentMethod2();
      }
      $('#deleteOrder').modal('hide');
      return;
    }
    this.disableButton = true;
    this.appService.manageHttp('delete', `orders/${orderId}`, '')
      .subscribe(res => {
        if (res && res.respCode && res.respCode === 206) {
          $('#deleteOrder').modal('hide');
          if(!type)
          this.toasterService.success(res.respMessage);
          this.NavbarService.callComponentMethod2();
          this.getAllOrders();
        } else {
          $('#deleteOrder').modal('hide');
          this.toasterService.error(res.errorMessage);
        }
        this.disableButton = false;
      }, (error) => {
        this.toasterService.error(' something went wrong');
        this.disableButton = false;
      });
  }




  // to get all orders in storage and display in cart
  getlocalStorageOrders() {
    if (localStorage.getItem('orders')) {
      let orders = JSON.parse(localStorage.getItem('orders'));
      if (orders.length > 0) {
        orders.forEach(order => {
          this.orders.push(order);
          this.grandTotalChange(order)
        });
      }
    }
  }


  // on proceed to check out click check user logged in or Not
  onProceedtoCheckOutClick() {
    if (!localStorage.getItem('userToken')) {
      this.toasterService.warning('Please Login To Continue');
      return;
    } else {

      this.changecartOrderStatus();
      // this.router.navigate(['/checkout']);
    }
  }


  // to place orders of products in cart
  changecartOrderStatus() {
    let orders=this.orders;
    this.disabled = true;
    let placeOrders = [];
    orders.forEach(order => {
      placeOrders.push({orderId:order._id});
    });
    var body={orders:placeOrders};
    this.appService.manageHttp('put', 'orders/updateCartOrders', body).subscribe(res => {
      if(res && res.length){
        let error;
        for (var j = 0; j< this.orders.length; j++) {
          res.forEach(order=>{
            if( this.orders[j]._id== order.orderId ){
              if(order.response.errorMessage){
                error=true;
                this.orders[j].message = order.response.errorMessage ;
              } else{
                error=false;
                this.orders[j].message = order.response.respMessage ;
              }
            }
          });
          }
          this.disabled = false;
          if(!error)
          this.router.navigate(['/checkout']);
        }
       
    }, (error) => {
      this.toasterService.error('Something Went Wrong');
       this.appService.loaderStatus('none');
    })
  }


  // onQuantity change
  onQuantityChange(event, order) {
    if (event.key) {
      this.orderQuantity = event.key;
      this.orderDetails = order;
    }

  }


  // clear shopping cart
  clearShopingCart(orders) {
    if (!localStorage.getItem('userToken')) {
      this.orders=[];
      localStorage.removeItem('orders');
      this.NavbarService.callComponentMethod2();
    } else {
      orders.forEach(order => {
        this.deleteOrder(order._id,'clear');
      });
  
    }
    
  }
}
