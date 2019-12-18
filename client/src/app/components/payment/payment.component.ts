import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../app.service";
import { AppConfig } from '../../app.config';
import { NavbarService } from '../../navbar.service';
declare var $;
declare let paypal: any;

@Component({
  selector: 'ross-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  ischecked1: any = false;
  ischecked2: any = true;
  ischecked3: any = false;
  form: FormGroup;
  disabled: boolean = false;
  bux: any = 0;
  euro: any = 0;
  paymentType: any = 'fromWallet';
  orders: any;
  shipmentAddress: any = {};
  orderTotal: any;
  disableButton: any = false;
  paymentMessage: any = false;
  walletData: any = {};
  euroTotalPercentage = 50;
  buxTotalPercentage = 50;
  paypalData: any = {};
  selectedCurrency: any = 'USD';
  paypalPaymentOrdersDesc: any = [];
  ShippingAmount: Number = 0;
  grandTotal: Number;
  orderTotal2: Number = 0;
  grandTotal2: Number = 0;
  shippingRateDetails: any = {};
  orderTotalInBux: Number = 0;
  grandTotalInBux: Number = 0;
  showPaymentTimedOut: any = false;
  loggedInUserObjId: any;
  userDetails: any;
  users: any = [];
  showWallet: boolean = true;
  payapalInfo: any;
  shippingTotal: Number = 0;
  shippingTotalInBux: Number = 0;
  CouponCode: any; // ng Model For Applying Counpon
  responseMsg: any = {};
  couponDetails: any = {};
  totalAfterDiscount: any;
  totalDisountinBux: any;
  shippingRates: any;
  shippingRatesInBUX: any;
  cashBack: any;
  constructor(public NavbarService: NavbarService, public appConfig: AppConfig, public router: Router, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) {
    this.form = fb.group({
      emailid: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });
    this.NavbarService.componentMethodCalledCurrency$.subscribe(
      () => {
        if (this.router.url == '/payment') {
          this.getAllOrders();
        }
      }
    );
    setTimeout(() => {
      this.getAllOrders();
    }, 1000);

    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user && user.user._id) {
        this.loggedInUserObjId = user.user._id;
      }
    }
    this.getUserDetails();
  }

  ngOnInit() {
    this.paypalData.clientId = this.appConfig.paypalPaymentClientId; // paypal client id

    $('#r11').on('click', function () {
      $(this).parent().find('a').trigger('click')
    })

    $('#r12').on('click', function () {
      $(this).parent().find('a').trigger('click')
    })
  }

  //On Applying COupon
  onApplyCoupon(data?: any) {
    if (data) {
      let Url = 'promocodes/checkPromoCodeIsValidOrNot?promoCode=' + data + '&selectPrice=' + this.orderTotal2 + '&defaultPrice=' + this.orderTotalInBux + '&selectedCurrency=' + this.appService.selectedCurrency.name;
      this.appService.loaderStatus('block');
      this.appService.manageHttp('get', Url, '').subscribe(res => {
        this.appService.loaderStatus('none');
        this.responseMsg = res;
        if (res && res.respCode && res.respCode === 200) {
          this.couponDetails = res;
          if (this.couponDetails.promoType && this.couponDetails.promoType === "Discount") {
            this.totalAfterDiscount = Number(this.grandTotal2) - Number(this.couponDetails.disountOnSelectedPrice);
            this.totalDisountinBux = Number(this.grandTotalInBux) - Number(this.couponDetails.discountOnDefaultPrice);
          } else if (this.couponDetails.promoType && this.couponDetails.promoType === "FreeShipping") {
            this.totalAfterDiscount = Number(this.orderTotal2) + Number(this.couponDetails.shippingRates);
            this.totalDisountinBux = Number(this.orderTotalInBux) + Number(this.couponDetails.shippingRatesInBUX);
          } else if (this.couponDetails.promoType && this.couponDetails.promoType === "Cashback") {
            this.cashBack = Number(this.couponDetails.cashBackInBUX)
          }
          this.toastrService.success(res.respMessage);

        } else {
          this.toastrService.error(res.errorMessage, 'error');
        }
      });
    } else {
      this.responseMsg.errorMessage = 'Enter Coupon Code';
      this.toastrService.error('Enter Coupon Code');
    }
  }

  // show details
  showDetails(type) {
    if (type == 'wallet') {
      this.showWallet = true;
      $('.wallet').addClass('btnActive');
      this.paymentType = 'fromWallet';

      if (!document.getElementById('paypal-button')) {
        setTimeout(() => {
          this.loadPayPal();
        }, 500);
      }

      $('.bitsolives').removeClass('btnActive');
    } else {
      this.showWallet = false;
      this.paymentType = 'fromBitsolives';
      $('.wallet').removeClass('btnActive');
      $('.bitsolives').addClass('btnActive');
    }

  }

  // on payment option change
  onItemChange(from, type?: any) {
    if (from && from == "first") {
      this.ischecked1 = false;
      this.ischecked2 = false;
      this.ischecked3 = false;
      if (type) {
        if (type == 'bitsolives') {
          this.ischecked2 = true;
          this.paymentType = 'fromBitsolives';
        } else if (type == 'fromWallet') {
          this.ischecked3 = true;
          this.paymentType = 'fromWallet';
        } else if (type == 'paypal') {
          this.ischecked1 = true;
        }
      }

    } else {
      if (this.ischecked1) {
        this.ischecked1 = false;
      } else {
        this.ischecked1 = true;
      }
    }
  }



  // to get all products added to cart
  getAllOrders() {
    this.orderTotal = 0;
    this.orderTotal2 = 0;
    this.shippingTotal = 0;
    this.shippingTotalInBux = 0;
    this.grandTotalInBux = 0;
    this.orderTotalInBux = 0;
    this.paypalPaymentOrdersDesc = [];
    this.appService.loaderStatus('block');
    var Url = 'Orders?filter={"limit": "' + this.appConfig.ordersPerPage + '","sortfield":"created","direction":"desc","criteria":[{ "key": "userId", "value": "' + this.appService.loginEmpDetails._id + '","type": "eq" },{ "key": "status", "value": "' + this.appConfig.orderPaymentStatus + '", "type": "regexOr"}]}';
    this.appService.manageHttp('get', Url, '').subscribe(res => {
      if (res && res.orders && res.orders.length > 0) {
        this.orders = res.orders;
        let orderDesc: any = {};
        this.orders.forEach(order => {
          order.ShippingAmount = 0;
          // order.subtotal = Number(order.inventory.Price) * Number(order.quantity);
          // this.orderTotal = Number(this.orderTotal) + Number(order.subtotal);
          if (order.shippingRateDetails && order.shippingRateDetails.shippingAmount) {
            if (order.shippingRateCurrencies && order.shippingRateCurrencies.length > 0) {
              let shippingRate = order.shippingRateCurrencies.find(s => s[this.appService.selectedCurrency.name]);
              order.ShippingAmount = Number(shippingRate[this.appService.selectedCurrency.name]);

              let shippingRateInBux = order.shippingRateCurrencies.find(s => s['BUX']);
              order.ShippingAmountInBux = Number(shippingRateInBux['BUX']);
            }
            // order.ShippingAmount = Number(order.shippingRateDetails.shippingAmount);
            // this.ShippingAmount = Number(this.ShippingAmount) + Number(order.ShippingAmount);
          }
          // this.grandTotal = this.orderTotal + Number(order.ShippingAmount);
          // to display grand total for currencies
          if (order.currencies) {
            let newcurrecy = order.currencies.find(c => c[this.appService.selectedCurrency.name]);
            let price = newcurrecy[this.appService.selectedCurrency.name];
            if (price) {
              if (this.appService.selectedCurrency.name != 'BUX') {
                this.selectedCurrency = this.appService.selectedCurrency.name;
              }
              order.subtotal2 = Number(price) * Number(order.quantity);
              this.orderTotal2 = Number(this.orderTotal2) + Number(order.subtotal2);
              this.shippingTotal = Number(this.shippingTotal) + Number(order.ShippingAmount);
              this.grandTotal2 = Number(this.orderTotal2) + Number(this.shippingTotal);

            }


            // to calculate  total in BUX
            let c = order.currencies.find(c => c['BUX']);
            let bitsolivesPrice = c['BUX'];
            if (bitsolivesPrice) {
              order.subtotalInBux = Number(bitsolivesPrice) * Number(order.quantity);
              this.orderTotalInBux = Number(this.orderTotalInBux) + Number(order.subtotalInBux);
              this.shippingTotalInBux = Number(this.shippingTotalInBux) + Number(order.ShippingAmountInBux);
              this.grandTotalInBux = Number(this.orderTotalInBux) + Number(this.shippingTotalInBux);
            }

          }
          if (order.shipmentAddress) {
            this.shipmentAddress = order.shipmentAddress;
          }
          let paypalCurrency; let paypalOrderPrice;
          if (this.appService.selectedCurrency.name == 'BUX') {
            paypalCurrency = this.appService.defaultCurrency.name;
            paypalOrderPrice = order.subtotal;
          } else {
            paypalCurrency = this.appService.selectedCurrency.name;
            paypalOrderPrice = order.subtotal2;
          }
          orderDesc = { tax: 0, sku: 0, name: order.entityName, quantity: order.quantity, currency: paypalCurrency, price: paypalOrderPrice };
          this.paypalPaymentOrdersDesc.push(orderDesc);
        });

        this.appService.loaderStatus('none');
      } else {
        this.orders = [];
        this.showPaymentTimedOut = true;
        this.appService.loaderStatus('none');
      }
      this.NavbarService.callComponentMethod2();
    }, (error) => {
      this.orders = [];
      this.toastrService.error('something went  wrong');
      this.appService.loaderStatus('none');
    })
  }


  // show bitsolives login model
  bitsolivesLogin() {
    $('#showBitsolivesLogin').appendTo("body").modal('show');
  }


  // to login bitsolives site and get wallet details
  onSubmitLogin(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      return;
    } else {
      this.disabled = true;
      this.appService.loaderStatus('block');
      this.appService.manageHttp('post', this.appConfig.bitsolviesServerUrl + 'users/signin', form.value, 'bitsolives')
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.appService.loaderStatus('none');
            this.toastrService.success(res.respMessage);
            if (res.details && res.details.wallet && res.details.wallet.BUX) {
              this.bux = res.details.wallet.BUX;
            }

            if (res.details && res.details.wallet && res.details.wallet.EUR)
              this.euro = res.details.wallet.EUR;

            if (res.details && res.details.userId)
              localStorage.setItem('bitsolivesUserId', res.details.userId);
            this.form.reset();
            this.disabled = false;
            $('#showBitsolivesLogin').modal('hide');
          } else {
            this.appService.loaderStatus('none');
            this.disabled = false;
            $('#showBitsolivesLogin').modal('hide');
            this.toastrService.error(res.errorMessage);
          }
        }, (error) => {
          this.toastrService.error('something went wrong');
          this.appService.loaderStatus('none');
        });
    }
  }







  // pay amount from bitsolives wallet
  payFromBitsolivesWallet() {
    for (var i = 0; i < this.users.length; i++) {
      let walletData: any = {};
      if (this.users[i].checked) {
        walletData.userId = this.users[i].userId;
        if(this.couponDetails && this.couponDetails.promoType){
          walletData.buxT = Number(this.totalDisountinBux);
        } else{
          walletData.buxT = Number(this.grandTotalInBux);
        }
        this.updateWallet(walletData);
      }
    }
  }


  // deduct amount from user walltes of bistsolives
  updateWallet(walletData) {
    this.disabled = true;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', this.appConfig.bitsolviesServerUrl + 'updateUserWalletFromEcomm', walletData, 'bitsolives')
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode200) {
          this.appService.loaderStatus('none');
          // this.toastrService.success(res.respMessage);
          if (res.details && res.details.wallet && res.details.wallet.BUX)
            this.bux = res.details.wallet.BUX;
          // walletData.euroToBux = Number(this.orderTotal - walletData.euro);
          this.walletData = walletData;
       //   console.log(this.walletData);
          this.walletData.bux = this.walletData.buxT;
          delete this.walletData.buxT;
          this.placeOrderForAllItemsInCart('bitsolives');

          this.form.reset();
          this.disabled = false;
          localStorage.removeItem('bitsolivesUserId');
        } else {
          this.appService.loaderStatus('none');
          this.disabled = false;
          this.toastrService.error(res.errorMessage);
        }
      }, (error) => {
        this.toastrService.error('something went wrong');
        this.appService.loaderStatus('none');
      });
  }


  // To place order for all available items in cart
  placeOrderForAllItemsInCart(paymentType?: any, paypalSuccessData?: any) {
    let itemsInCart = [];
    let payTotal = 0;
    this.orders.forEach(order => {
      if (order.currencies) {
        let price;
        if (paymentType && (paymentType == 'bitsolives' || paymentType == 'wallet')) {
          let c = order.currencies.find(c => c['BUX']);
          price = c['BUX'];
          order.currency = 'BUX';
        } else {
          if (this.selectedCurrency == 'BUX') {
            let c = order.currencies.find(c => c[this.appService.defaultCurrency.name]);
            order.currency = this.appService.defaultCurrency.name;
            price = c[this.appService.defaultCurrency.name];
          } else {
            let c = order.currencies.find(c => c[this.selectedCurrency]);
            order.currency = this.selectedCurrency;
            price = c[this.selectedCurrency];
          }
        }

        if (price) {
             order.price = Number(price) * Number(order.quantity);
        } else {
          // order.currency = this.appService.defaultCurrency.name;
          // order.price = Number(order.inventory.Price) * Number(order.quantity);
        }
        if(this.couponDetails && this.couponDetails.promoType){
          if(this.couponDetails && this.couponDetails.promoType === 'Discount'){
            order.total = this.totalDisountinBux;
           // order.total = Number(this.totalAfterDiscount) + Number(order.ShippingAmountInBux);
          } else if(this.couponDetails && this.couponDetails.promoType === 'FreeShipping'){
             order.total = Number(order.price) + 0;
          }
        }else{
           order.total = Number(order.price) + Number(order.ShippingAmountInBux);
        }
        payTotal = order.total + Number(payTotal);
      }

      let orderObj = {
        orderId: order._id,
        currency: order.currency,
        price: order.price,
        shippingCharges: order.ShippingAmountInBux,
        total: order.total,
        shippingRateDetails: order.shippingRateDetails,
      };
      itemsInCart.push(orderObj);

    });
    let orderDetails: any = {};
    let couponDetails:any = {};
    orderDetails.orders = itemsInCart;
    orderDetails.totalPrice = payTotal;
    // orderDetails.shippingCharges = this.ShippingAmount;
    orderDetails.payments = {};
    if(this.couponDetails && this.couponDetails.promoType){
      couponDetails.promoType = this.couponDetails.promoType ;
      couponDetails.promocodeId = this.couponDetails.promocodeId;
      if(this.couponDetails && this.couponDetails.promoType && this.couponDetails.promoType === 'Discount'){
        couponDetails.discount = this.couponDetails.discountOnDefaultPrice;
        couponDetails.discountInBux = this.couponDetails.disountOnSelectedPrice;
      } else if (this.couponDetails && this.couponDetails.promoType && this.couponDetails.promoType === 'FreeShipping') {
        couponDetails.discount = this.couponDetails.shippingRates;
        couponDetails.discountInBux = this.couponDetails.shippingRatesInBUX;
      }
      orderDetails.coupon = couponDetails;
    }
    if (paymentType == 'payPalPayment' && paypalSuccessData) {
      orderDetails.payments.paypal = paypalSuccessData;
      this.placeOrderForItemsBasedOnPayment(orderDetails);
    } else {
      if (this.walletData && paymentType == 'bitsolives') {
        orderDetails.payments.bitsolives = this.walletData;
        this.placeOrderForItemsBasedOnPayment(orderDetails);
      }
      if (paymentType == 'wallet' && this.walletData) {
        orderDetails.payments.wallet = this.walletData;
        this.placeOrderForItemsBasedOnPayment(orderDetails);
      }
      else {
        return;
      }
    }
  }

  // To place order for all available items in cart based on payment option
  placeOrderForItemsBasedOnPayment(orderDetails) {
    let showOrders = this.orders;
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
              if (response.order) {
              } else if (response.response.errorMessage) {
                this.toastrService.error(response.response.errorMessage);
                return;
              } if (response.response.respMessage) {
                paymetnSuccessMessage = response.response.respMessage;
                return paymentSuccess = true;
              }
            }
          });
          if (paymentSuccess) {
            window.scrollTo(0, 0);
            this.orders = showOrders;
            this.paymentMessage = true;
            this.NavbarService.callComponentMethod2();
          }
          this.appService.loaderStatus('none');
          this.disableButton = false;
        }
        else {
          this.toastrService.error('Try again later');
          this.appService.loaderStatus('none');
          this.disableButton = false;
        }

      }, (error) => {
        this.toastrService.error('Something Went Wrong');
        this.appService.loaderStatus('none');
        this.disableButton = false;
      });
  }



  // To get UserDetails
  getUserDetails() {
    let url = 'buyers/' + this.loggedInUserObjId;
    this.appService.manageHttp('get', url, '')
      .subscribe((res) => {
        if (res.details) {
          this.userDetails = res.details;
          if (this.userDetails && this.userDetails.isBitsolivesUser) {
            this.getUserWalletsbasedOnEmail(this.userDetails.email);
          }
        } else {
          this.userDetails = {};
        }
      });
  }



  // Pay From Wallet
  payFromWallet() {
    // console.log(this.payapalInfo);
    let obj: any = {};
    obj.wallet = {};
    obj.type = 'Deduct';
    if (this.couponDetails && this.couponDetails.promoType) {
        obj.wallet.BUX = this.totalDisountinBux;
    } else {
      if (this.grandTotalInBux) {
        obj.wallet.BUX = Number(this.grandTotalInBux);
      } else {
        obj.wallet.BUX = 0;
      }
    }

    this.appService.manageHttp('put', `buyers/${this.loggedInUserObjId}`, obj)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode200) {
          this.walletData = {};
          if(this.couponDetails && this.couponDetails.promoType){
            this.walletData.Bux = this.totalDisountinBux;
          } else{
            this.walletData.Bux = this.grandTotalInBux;
          }
          this.placeOrderForAllItemsInCart('wallet');
          // this.toastrService.success(res.respMessage);
        } else {
          this.toastrService.error(res.errorMessage);
          return;
        }
      });
  }


  // get all user wallets based on email from bitsolives
  getUserWalletsbasedOnEmail(email) {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', this.appConfig.bitsolviesServerUrl + 'getUsersByEmailId?emailid=' + email, '', 'bitsolives')
      .subscribe((res) => {
        if (res && res.users && res.users.length > 0) {
          this.appService.loaderStatus('none');
          this.users = res.users;
          this.users.forEach(user => {
            user.checked = false;
            user.disabled = false;
          });
        } else {
          this.appService.loaderStatus('none');
          this.disabled = false;
          this.toastrService.error(res.errorMessage);
        }
      }, (error) => {
        this.toastrService.error('something went wrong');
        this.appService.loaderStatus('none');
      });
  }

  // select wallet 
  selectWallet(i) {
    this.users.forEach(user => {
      user.checked = false;
    });
    this.users[i].checked = true;
  }



  // Pay From Wallet
  addAmountFromPaypalToUserWalletInBux(payapalInfo) {
    let obj: any = {};
    obj.wallet = {};
    obj.type = 'Add';
    if (this.grandTotalInBux) {
      obj.wallet.BUX = Number(this.grandTotalInBux);
    } else {
      obj.wallet.BUX = 0;
    }
    if (payapalInfo) {
      obj.paypalInfo = payapalInfo;
    }
    this.appService.manageHttp('put', `buyers/${this.loggedInUserObjId}`, obj)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode200) {
          this.toastrService.success(res.respMessage);
          this.getUserDetails();
        } else {
          this.toastrService.error(res.errorMessage);
          return;
        }
      });
  }



  // Paypal payment procedure start

  // To load paypal payment script
  ngAfterViewInit(): void {
    this.loadPayPal();
  }

  loadPayPal() {
    let env;
    let client;
    var self = this;
    if (this.appConfig.paypalLive) {
      console.log('live');
      env = 'production',
        client = {
          production: self.paypalData.clientId,
        }
    } else {
      console.log('test');
      env = 'sandbox',
        client = {
          production: '',
          sandbox: self.paypalData.clientId
        }
    }
    const elementExists: boolean = !!document.getElementById('paypal-button');
    if (elementExists) {
      paypal.Button.render({
        env: env,
        client: client,
        commit: true,
        payment: function (data, actions) {
          return self.onPayment(data, actions);
        },
        onAuthorize: function (data, actions) {
          return self.onAuthorize(data, actions);
        }
      }, '#paypal-button');
    }
  }




  onPayment(data, actions) {
    let orderTotal; let currency;
    if (this.appService.selectedCurrency.name == 'BUX') {
      orderTotal = this.orderTotal;
      currency = this.appService.defaultCurrency.name;
    } else {
      orderTotal = Number(this.appService.decimalValues(this.orderTotal2)) + Number(this.appService.decimalValues(this.shippingTotal));
      currency = this.selectedCurrency;
    }
    this.paypalData.paymentData = {
      transactions: [{
        amount: {
          total: orderTotal,
          currency: currency,
          details: {
            subtotal: Number(this.appService.decimalValues(this.orderTotal2)),
            tax: 0,
            shipping: Number(this.appService.decimalValues(this.shippingTotal)),
            handling_fee: 0,
            shipping_discount: 0,
            insurance: 0
          }
        },
        description: 'The payment transaction description.',
        custom: '90048630024435',
        //invoice_number: '12345', Insert a unique invoice number
        payment_options: {
          allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
        },
        soft_descriptor: 'ECHI5786786',
        item_list: {
          items: this.paypalPaymentOrdersDesc,
          // shipping_address: {
          //   recipient_name: this.shipmentAddress.name,
          //   line1: this.shipmentAddress.street,
          //   city: this.shipmentAddress.city,
          //   country_code: this.shipmentAddress.country,
          //   postal_code: this.shipmentAddress.zip,
          //   phone: this.shipmentAddress.phone,
          //   state: this.shipmentAddress.state
          // }
        }
      }],
      note_to_payer: 'Contact us for any questions on your order.'
    }

    var self = this;
    return actions.payment.create({
      payment: self.paypalData.paymentData
    })
  }

  onAuthorize(data, actions) {
    var self = this;
    return actions.payment.execute().then(function (payment) {
      console.log(payment);

      if (payment.state && payment.state === 'approved') {
        ;
        self.addAmountFromPaypalToUserWalletInBux(payment);
      } else {
        self.toastrService.error('Payment failed From Paypal');
      }
    });
  }
  // Paypal payment procedure ends


}
