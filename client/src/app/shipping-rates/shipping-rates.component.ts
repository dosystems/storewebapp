import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../app.service";
import { AppConfig } from '../app.config';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
@Component({
  selector: 'ross-shipping-rates',
  templateUrl: './shipping-rates.component.html',
  styleUrls: ['./shipping-rates.component.css']
})
export class ShippingRatesComponent implements OnInit {
  orders: any;
  shipmentAddress: any = {};
  grandTotal: any;
  shippingRates: any;
  parcel: any = [{
    "weight": {
      "value": 1.0,
      "unit": "ounce"
    },
    "dimensions": {
      "unit": "inch",
      "length": 12.0,
      "width": 7.1,
      "height": 6.0
    }
  }];
  constructor(public appConfig: AppConfig, public router: Router, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) { }

  ngOnInit() {
    this.getAllOrders();
  }


  // to get all products added to cart
  getAllOrders() {
    this.grandTotal = 0;
    this.appService.loaderStatus('block');
    var URL = 'Orders?filter={"limit": "' + this.appConfig.ordersPerPage + '","sortfield":"created","direction":"desc","criteria":[{ "key": "userId", "value": "' + this.appService.loginEmpDetails._id + '","type": "eq" },{ "key": "status", "value": "' + this.appConfig.orderPaymentStatus + '", "type": "regexOr"}]}';
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.totalQuantity) {
        // To update count in navbar
      }
      if (res && res.orders && res.orders.length > 0) {
        this.orders = res.orders;
        for (const order of this.orders) {
          order.shippingRateDetails = {};
          this.getShippingRates(order).then(res => {
            order.deliveryOptions = res;
          });
        }
        this.appService.loaderStatus('none');
      } else {
        this.orders = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.orders = [];
      this.toastrService.error('something went  wrong');
      this.appService.loaderStatus('none');
    })
  }



  // to get shipping rates from the addresss

  getShippingRates(order) {

    let promise = new Promise(async (resolve, reject) => {
      this.appService.loaderStatus('block');
      var body: any = {};
      if (order.shipmentAddress&&order.shipmentAddress.zip) {
        let toAddress: any = {};
        toAddress.address_line1 = order.shipmentAddress.street;
        toAddress.city_locality = order.shipmentAddress.city;
        toAddress.state_province = order.shipmentAddress.state;
        toAddress.postal_code = order.shipmentAddress.zip;
        toAddress.country_code = order.shipmentAddress.countryCode;
        toAddress.name = order.shipmentAddress.name;
        toAddress.phone = order.shipmentAddress.phone;
        body.shipTo = toAddress;
      }

      if (order && order.shippingFrom && order.shippingFrom.zip) {
        let fromAddress: any = {};
        fromAddress.address_line1 = order.shippingFrom.street;
        fromAddress.city_locality = order.shippingFrom.city;
        fromAddress.state_province = order.shippingFrom.state;
        fromAddress.postal_code = order.shippingFrom.zip;
        fromAddress.country_code = order.shippingFrom.countryCode;
        fromAddress.name = order.shippingFrom.name;
        fromAddress.phone = order.shippingFrom.phone;
        body.shipFrom = fromAddress;
      } else {
        body.shipFrom = this.appConfig.shippingFromAddress;
      }
      body.parcel = this.parcel;
      this.appService.manageHttp('post', 'sellers/shipmentRates', body).subscribe(res => {
        if (res && res.shipmentRates && res.shipmentRates.length > 0) {
          this.shippingRates = res.shipmentRates;
          this.shippingRates.forEach(rate => {
            rate.estimatedDelivery=moment(rate.estimatedDeliveryOn).format(this.appConfig.userFormat3);
            if(rate.serviceType.includes('FedEx International'))
            rate.serviceType=rate.serviceType.replace(/FedEx International/g, '');
            if(rate.serviceType.includes('®'))
            rate.serviceType=rate.serviceType.replace(/®/g, '');
          });
          resolve(this.shippingRates);
        } else if(res &&res.errorCode) {
          this.shippingRates = [];
          if(res.errorMessage)
          order.message=res.errorMessage;
          return;
        }
      }, (error) => {
        this.shippingRates = [];
        if(error.error&&error.error.errorMessage)
        order.message=error.error.errorMessage;
        return;
      });

    });
    return promise;
  }



  // to select delivery option for each order
  selectDeliveryOption(option, i) {
    this.orders[i]['shippingRateDetails'] = option;
  }

  // to continue payment 
  continueToPayment() {
    for (var i = 0; i < this.orders.length; i++) {
      this.updateOrderWithSelectedDeliveryOption(this.orders[i]);
    }
    this.router.navigate(['/payment']);
  }
  // to save shipping rates for each order
  updateOrderWithSelectedDeliveryOption(order) {
    if (order.shippingRateDetails && !order.shippingRateDetails.shippingAmount) {
      order['shippingRateDetails'] = order['deliveryOptions'][0];
    }
    if(order['shippingRateDetails'].estimatedDelivery)
    delete order['shippingRateDetails'].estimatedDelivery;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'orders/' + order._id, order)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode205) {
          this.appService.loaderStatus('none');
        } else {
          this.toastrService.error(res.errorMessage);
          this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.toastrService.error('Something Went Wrong');
        this.appService.loaderStatus('none');
      });
  }
}
