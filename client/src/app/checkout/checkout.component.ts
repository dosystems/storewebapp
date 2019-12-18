import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../app.service";
import { AppConfig } from '../app.config';
import { Router } from "@angular/router";
@Component({
  selector: 'ross-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  orders: any = [];
  grandTotal: any = 0;
  loggedInUserObjId: any;
  previousAddresses: any = [];
  addressDetails: any = {};
  addressId: any;
  userDetailsObjId: any;
  submitted: any = false;
  selectedDeliveryAddress: boolean = false;
  disabled: boolean = false;
  countries:any;
  countryValidation:boolean=false;
  constructor(fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService, private toastrService: ToastrService) {
    this.getLoddedInUserId();
    this.getAllOrders();

    this.form = fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      country: [''],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getPreviousUserAddresses();
  }

  getLoddedInUserId() {
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user && user.user._id) {
        this.loggedInUserObjId = user.user._id;
      }
    }
  }

  // To get previous user addresses
  getPreviousUserAddresses() {
    let filterCriteria = {};
    let criteria = [];

    filterCriteria['limit'] = 20;
    filterCriteria['sortfield'] = 'created';
    filterCriteria['direction'] = 'desc';

    criteria.push({ "key": '_id', "value": this.loggedInUserObjId, "type": "eq" });

    if (criteria && criteria.length > 0) {
      filterCriteria['criteria'] = criteria;
    }
    let url = 'buyers?filter=' + JSON.stringify(filterCriteria);
    this.previousAddresses = [];
    this.appService.manageHttp('get', url, '')
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode200) {
          if (res.buyers && res.buyers.length && res.buyers.length > 0) {
            this.userDetailsObjId = res.buyers[0]._id;
            let userAddresses = res.buyers[0].address;
            userAddresses.forEach(address => {
              if (address.active && address.active == true) {
                this.previousAddresses.push(address);
              }
            });
          }
        } else {
          this.previousAddresses = [];
        }
      });
  }

  // On select options in  edit or delete address
  onSelectOptions(address, type?: any) {
    this.addressDetails = {};
    this.addressId = address._id;
    if (type === 'Edit') {
      this.addressDetails = JSON.parse(JSON.stringify(address));
      this.addressDetails.country={ name:this.addressDetails.country };
    } else if (type === 'Delete') {
      this.deleteShipementAddress();
    }
  }

  // To delete shipment address
  deleteShipementAddress() {
    let shipmentAddress: any = {};
    let address: any = {};
    address.operation = 2;
    address._id = this.addressId;
    shipmentAddress.address = address;

    this.appService.manageHttp('put', `buyers/${this.userDetailsObjId}`, shipmentAddress)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode205) {
          this.getPreviousUserAddresses();
          this.toastrService.success(res.respMessage);
        } else {
          this.toastrService.error(res.errorMessage);
        }
      });
  }

  // Adding or updating shipment address
  addOrUpdateShipmentAddress(form?: any) {
    if(this.addressDetails&&this.addressDetails.country){
      if(this.addressDetails.country.countryCode){
        form.value.countryCode=this.addressDetails.country.countryCode;
      } else if(this.addressDetails.countryCode){
        form.value.countryCode=this.addressDetails.countryCode;
      }
      if(this.addressDetails.country.name){
        this.addressDetails.country=this.addressDetails.country.name;
        form.value.country=this.addressDetails.country;
      }else{
        this.countryValidation = true;
      }
      
    }
    if (form && form.status && form.status === 'INVALID' || (!form.value.country)) {
      this.submitted = true;
      return
    } else {
      this.selectedDeliveryAddress = true;
      this.submitted = false;
      if (this.addressId) {
        form.value.operation = 1;
        form.value._id = this.addressId;
      } else {
        form.value.operation = 0;
      }
      this.changeDeliverAddress(form.value);
    }
  }

  // Changing deliver address
  changeDeliverAddress(address) {
    this.selectedDeliveryAddress = true;
    let shipmentDetails: any = {};
    shipmentDetails.address = address;
    if (this.orders && this.orders.length && this.orders.length > 0) {
      let orderDetails: any = [];
      this.orders.forEach(order => {
        orderDetails.push({ 'orderId': order._id })
      });
      shipmentDetails.orders = orderDetails;
      this.appService.loaderStatus('block');
      this.appService.manageHttp('put', 'orders/updateShipmentAddress', shipmentDetails)
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.appService.loaderStatus('none');
            this.addressId = '';
            // this.router.navigate(['/payment']);
            setTimeout(() => {
              this.router.navigate(['/shippingRates']);
            }, 500);
           
            // localStorage.setItem('shippingAddress',JSON.stringify({shipmentDetails}));
            this.form.reset();
          } else {
            this.toastrService.error(res.errorMessage);
            this.appService.loaderStatus('none');
          }
        }, (error) => {
          this.toastrService.error('Something Went Wrong');
          this.appService.loaderStatus('none');
        });
    } else {
      this.toastrService.error('Orders not available');
    }
  }

  // To get all orders available in cart
  getAllOrders() {
    this.appService.loaderStatus('block');
    var URL = 'Orders?filter={"limit": "' + this.appConfig.ordersPerPage + '","sortfield":"created","direction":"desc","criteria":[{ "key": "userId", "value": "' + this.appService.loginEmpDetails._id + '","type": "In" },{ "key":"status" , "value":"' + this.appConfig.orderPaymentStatus + '" , "type":"regexOr"}]}';
    this.appService.manageHttp('get', URL, '')
      .subscribe(res => {
        if (res && res.respCode == this.appService.respCode200) {
          this.appService.loaderStatus('none');
          this.orders = res.orders;
        } else {
          this.appService.loaderStatus('none');
          this.toastrService.error(res.errorMessage);
          this.orders = [];
        }
      }, (error) => {
        this.appService.loaderStatus('none');
        this.toastrService.error('Something went wrong');
      });
  }

  // to make  payment for  orders
  paymentForOrders(orders) {
    if (!this.selectedDeliveryAddress) {
      this.toastrService.error('Please Select Delivery Address To Make Payment');
      return;
    }
    this.disabled = true;
    let placeOrders = [];
    for (var i = 0; i < orders.length; i++) {
      let obj: any = {};
      obj.orderId = orders[i]._id;
      placeOrders.push(obj);
    }
    var body = { orders: placeOrders, totalPrice: this.grandTotal };
    this.appService.manageHttp('put', 'orders/updateOrderPayment', body).subscribe(res => {
      if (res) {
        let error;
        for (var j = 0; j < res.length; j++) {
          if (res[j].response.errorMessage) {
            error = true;
          } else {
            error = false;
          }
        }
        if (error) {
          this.toastrService.error("Payment failed, please check your wallet balance");
        } else {
          this.toastrService.success(" Payment Completed Successfully");
        }
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastrService.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })
  }



   // to get all Countries
   getAllCountries(event: any) {
     this.submitted=false;
     this.countryValidation=false;
    if (event && event.query) {
      var URL = 'countries?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.countries = res.countrys;
        } else {
          this.countries = [];
        }
      });
    }
  }
}
