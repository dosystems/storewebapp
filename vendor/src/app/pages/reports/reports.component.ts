import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "../../app.service";
import { AppConfig } from '../../app.config';
import * as moment from 'moment/moment';

@Component({
  selector: 'az-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  totalRecords: Number = 0;
  reports: any = [];
  exportCsvColoumns: any = [];
  reportType: any;
  shippingStatus: any = [];
  subscriptionStatusTypes: any = [];
  subscriptions: any = [];
  subscriptionExportColumns: any = [];
  reviews: any = [];
  salesSummary: any = [];
  loginVendorid: any;
  reviewsCsv:any = [];

  constructor(public router: Router,public appConfig:AppConfig, public appService: AppService, public activatedroute: ActivatedRoute) {
    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    this.appService.getLocalStorageData();    

    this.shippingStatus = [
      { label: 'All', value: null },
      { label: 'Delivered', value: 'Delivered' },
      { label: 'Shipped', value: 'Shipped' }
    ];

    this.subscriptionStatusTypes = [
      { label: 'All', value: null },
      { label: 'Active', value: 'Active' },
      { label: 'Expired', value: 'Expired' }
    ];

    this.subscriptionExportColumns = [
      { header: 'S.No ', field: 'serialNo' },
      { header: 'Name ', field: 'planName' },
      { header: 'Amount', field: 'actualAmount' },
      { header: 'Duration', field: 'duration' },
      { header: 'Start Date', field: 'startDate' },
      { header: 'Expiry Date', field: 'startDate' },
      { header: 'Status', field: 'status' }
    ];
    this.reviewsCsv = [
      { header: 'S.No ', field: 'serialNo' },
      { header: 'Review ', field: 'comment' },
      { header: 'Rating', field: 'rating' },
      { header: 'Product', field: 'entityName' },
      { header: 'Buyer', field: 'createdBy.name' },
      { header: 'Created', field: 'created' }      
    ]
    activatedroute.params.subscribe(p => { this.reportType = p['reportType'] });

    if (this.reportType && this.reportType == 'shippingReport'
      || this.reportType == 'productSalesReport') {
      this.getAllReports();
    } else if (this.reportType == 'salesSummery') {
      this.getSalesSummary();
    }
  }

  changeExportCSVOptions() {
    this.exportCsvColoumns = [
      { header: 'S.No ', field: 'serialNo' },
      { header: 'Product ', field: '_id.entityName' },
      { header: 'Quantity', field: 'totalQuantity' }
    ];

    if (this.reportType === 'productSalesReport') {
      this.exportCsvColoumns.push({ header: 'Amount', field: 'totalAmount' });
    } else if (this.reportType === 'shippingReport') {
      this.exportCsvColoumns.push({ header: 'Status', field: '_id.status' })
    }
    if (this.reportType === 'salesSummery') {
      this.exportCsvColoumns = [];
      this.exportCsvColoumns = [
        { header: 'S.No ', field: 'serialNo' },
        { header: 'Quantity', field: 'totalQuantity' },
        { header: 'Amount', field: 'totalAmount' },
        { header: 'Date', field: 'dates' },

      ];


    }
  }

  ngOnInit() {

  }

  // To get all product sales report and shipping report
  getAllReports() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', 'sellers/reports', '').subscribe(res => {
      if (res) {
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        if (this.reportType === 'productSalesReport') {
          if (res.productWiseSalesReport && res.productWiseSalesReport.length && res.productWiseSalesReport.length > 0) {
            this.reports = res.productWiseSalesReport;
          }
        } else if (this.reportType === 'shippingReport') {
          if ((res.itemsToBeShipped && res.itemsToBeShipped.length && res.itemsToBeShipped.length > 0)
            || (res.itemsDelivered && res.itemsDelivered.length && res.itemsDelivered.length > 0)) {
            this.reports = res.itemsDelivered.concat(res.itemsToBeShipped);
          }
        } else {
          this.reports = [];
        }
        this.reports.forEach((report, index) => {
          report.serialNo = (index + 1);
        });
      }
      this.appService.loaderStatus('none');
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }

  // Get subscription report
  getSubscriptionReport(event?: any) {
    this.changeExportCSVOptions()
    // To apply pagination and filtering and soting
    let filterLabels = ['planName', 'duration', 'endDate', 'actualAmount', 'ammountPaid', 'status', 'startDate'];
    let filterCriteria = this.appService.EventData(event, filterLabels);
    if (!filterCriteria) {
      return
    }

    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }

    filterCriteria['criteria'].push({
      "key": "sellerId",
      "value": this.appService.loginVendorDetails._id,
      "type": "eq"
    });

    let URL = `subscriptions?filter=${JSON.stringify(filterCriteria)}`;

    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res) {
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        if (res.subscriptions && res.subscriptions.length && res.subscriptions.length > 0) {
          this.subscriptions = res.subscriptions;
          this.subscriptions.forEach((subscription, index) => {
            // To show serial number
            if (event && event.first) {
              subscription.serialNo = (index + 1) + event.first;
            } else {
              subscription.serialNo = (index + 1);
            }
          });
        } else {
          this.subscriptions = [];
        }
      }
      this.appService.loaderStatus('none');
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    })
  }

//Reviews Vendor Got
  getReviews(event?: any) {
    let filterLabels = ['entityName', 'comment', 'rating', 'userName', 'created'];
    let filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }    
    if (!filterCriteria) {
      return
    }
    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }
    // filterCriteria['criteria'].push({
    //   "key": "ownerId",
    //   "value": this.appService.loginVendorDetails._id,
    //   "type": "in"
    // });
    let url = 'sellers/reviews?filter=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', url, '').subscribe(res => {
      if (res && res.reviews && res.reviews.length && res.reviews.length > 0) {
        this.reviews = res.reviews;
        this.reviews.forEach((review, index) => {
          // To show serial number
          if (event && event.first) {
            review.serialNo = (index + 1) + event.first;
          } else {
            review.serialNo = (index + 1);
          }
        });
      } else {
        this.reviews = [];
      }
    })
  }

//get list of sales summary
  getSalesSummary(event?: any) {
    this.changeExportCSVOptions();
    let filterLabels = ['dates', 'totalAmount', 'totalQuantity'];
    let filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }    
    if (!filterCriteria) {
      return
    }
    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }

    let url = 'sellers/salesSummary?filters=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', url, '').subscribe(res => {
      if (res) {
        this.salesSummary = res;
        for(var i=0;i<this.salesSummary.length;i++){
          if(event && event.first){
              this.salesSummary[i].serialNo = (i+1) + event.first;
          } else{
            this.salesSummary[i].serialNo = i+1;
          }
          this.salesSummary[i].dates = moment(this.salesSummary[i].dates,'DD/MM/YYYY').format('MM/DD/YYYY');
        }
      } else {
        this.salesSummary = [];
      }
    })

  }


}
