import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
declare var $;

@Component({
  selector: 'az-detailspage',
  templateUrl: './detailspage.component.html',
  styleUrls: ['./detailspage.component.scss']
})
export class DetailspageComponent implements OnInit {
  detailsType: string;
  customerDetails: any = {};
  activityHistory: any = [];
  totalRecords: number;
  customerId: any;
  merchantId: any;
  productId:any;
  orderId:any;
  merchantDetails:any = {};
  productDetails:any = {};
  orderDetails:any ={};
  objectKeys = Object.keys;
  inventory: any = [];  
  listofStatements: any = [];
  Expenses = 0;
  Incomes = 0;  
  imagesPath = this.appConfig.imageUrl + 'entity/';
  iter:number =0;


  constructor(public router: Router, public appService: AppService, public activatedroute: ActivatedRoute, public appConfig: AppConfig, public toastr: ToastrService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    activatedroute.params.subscribe(p => { this.detailsType = p['Type'] });
    if (this.detailsType === 'Customer') {
      activatedroute.queryParams.subscribe(p => { this.customerId = p['id'] });
      this.getCustomerDetails(this.customerId);
    }
    if (this.detailsType === 'Merchant') {
      activatedroute.queryParams.subscribe(p => { this.merchantId = p['id'] });
      this.getMerchantDetails(this.merchantId);
    }
     if (this.detailsType === 'Product') {
      activatedroute.queryParams.subscribe(p => { this.productId = p['id'] });
      this.getProductDetails(this.productId);
    }
     if (this.detailsType === 'Order') {
      activatedroute.queryParams.subscribe(p => { this.orderId = p['id'] });
      this.getOrderDetails(this.orderId);
    }
  }

  ngOnInit() {

  }

  //For OrderDetailsById
  getOrderDetails(id) {
    this.appService.manageHttp('get', 'orders' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.orderDetails = res.details;
        delete this.orderDetails.shipmentAddress.active;
        if(this.orderDetails.currencies[this.iter].USD){
          this.orderDetails.totalInUsd  = this.orderDetails.currencies[this.iter].USD+ this.orderDetails.shippingRateCurrencies[this.iter].USD;
        }else{
          this.orderDetails.totalInUsd=0;
        }
        

      } else {
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
  }
  
  //Customer Details
  getCustomerDetails(id) {
    this.appService.manageHttp('get', 'buyers' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.customerDetails = res.details;
      } else {
        this.customerDetails = {};
      }
    }, (error) => {
      this.toastr.error("customer Doesn't Exist");
    });
  }
  //Merchant Details
  getMerchantDetails(id){
    this.appService.manageHttp('get','sellers' + '/' + id,'').subscribe(res =>{
      if(res && res.details){
          this.merchantDetails = res.details;
      } else {
        this.merchantDetails = {};
      }
    },(error)=>{
      this.toastr.error("Seller Doesn't Exist");
    });
  }

  //For getting Product details By id
  getProductDetails(id) {
    this.appService.manageHttp('get', 'entities' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.productDetails = res.details;
        if(this.productDetails.inventories && this.productDetails.inventories.length > 0){
          for(var i=0;i<this.productDetails.inventories.length;i++){
             delete this.productDetails.inventories[i].MRPCurrency;
             delete this.productDetails.inventories[i].Currency;
          }
        }
        this.inventory = this.productDetails.inventories[0];
      }
      else {
        this.productDetails = {};
         this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
     this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
  }
  //Get History Table 
  getHistory(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['context', 'contextType', 'desc', 'created'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    if (!filterCriteria.criteria) {
      filterCriteria.criteria = [];
    }
    var AnyID;
    if (this.detailsType === 'Customer') {
      AnyID = this.customerId;
    }
    if (this.detailsType === 'Merchant') {
      AnyID = this.merchantId;
    }
    if (this.detailsType === 'Product') {
      AnyID = this.productId;
    }
    if (this.detailsType === 'Order') {
      AnyID = this.orderId;
    }
    filterCriteria.criteria.push({ "key": "contextId", "value": AnyID, "type": "in" });
    URL = 'activities' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.activities && res.activities.length && res.activities.length > 0) {
        this.activityHistory = res.activities;
        // this.showHistoryTable = true;
        for (let i = 0; i < this.activityHistory.length; i++) {
          if (event && event.first) {
            this.activityHistory[i].srNo = (i + 1) + event.first;
          }
          else {
            this.activityHistory[i].srNo = i + 1;
          }

        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      }
      else {
        this.activityHistory = [];
        this.appService.displayToasterMessage(res.errorMessage);
         this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }


}
