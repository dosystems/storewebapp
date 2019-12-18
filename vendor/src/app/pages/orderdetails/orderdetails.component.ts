import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare var $: any;

@Component({
  selector: 'az-orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrls: ['./orderdetails.component.scss']
})
export class OrderdetailsComponent implements OnInit {
  orderDetailsId: any;
  orderDetails: any = {};
  activity: any = {};
  orderHistory: any = [];
  totalRecords: any;
  pageNumber: any;
  sellerWallet: any;
  buyerWallet: any;
  listofStatements: any = [];
  Expenses = 0;
  Incomes = 0;
  showOrderHistoryTable: boolean = true;
  objectKeys = Object.keys;

  constructor(public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) {
    activeRoute.params.subscribe(p => { this.orderDetailsId = p['id'] });
    if (this.orderDetailsId) {
      this.getOrderDetailsById(this.orderDetailsId);
    }
  }

  ngOnInit() {

  }
  //For OrderDetailsById
  getOrderDetailsById(id) {
    this.appService.manageHttp('get', 'orders' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.orderDetails = res.details;
        //  this.getWalletDetails()
        this.getFilterStatements();
      } else {
        this.toastr.error(res.respMessage);
      }
    }, (error) => {
      this.toastr.error('something went wrong');
    })
  }

  //For order History & pagination
  getOrderHistory(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = [];
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
    filterCriteria.criteria.push({ "key": "contextId", "value": this.orderDetailsId, "type": "in" });
    URL = 'activities' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.activities && res.activities.length && res.activities.length > 0) {

        this.orderHistory = res.activities;
        this.showOrderHistoryTable = true;

        for (let i = 0; i < this.orderHistory.length; i++) {
          if (event && event.first) {
            this.orderHistory[i].srNo = (i + 1) + event.first;
          }
          else {
            this.orderHistory[i].srNo = i + 1;
          }
          if (this.orderHistory[i].created) {
            this.orderHistory[i].created = moment(this.orderHistory[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        // this.toastr.show(res.respMessage);
      } else {
        this.orderHistory = [];
        this.showOrderHistoryTable = false;
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }

  //For Filtering statemtns by order
  getFilterStatements() {
    var filterCriteria = {
      "page": 1, "limit": 100, "sortfield": "created", "direction": "desc",
      "criteria": [{ "key": "orderId", "value": this.orderDetailsId, "type": "in" }]
    };
    let URL = 'statements' + '?filter=' + JSON.stringify(filterCriteria) + '';
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.respCode === 200) {
        this.listofStatements = res.statements;
        for (var i = 0; i < this.listofStatements.length; i++) {

          if (this.listofStatements[i].type === 'EXPENSE') {
            this.Expenses = this.Expenses + this.listofStatements[i].amount;
            console.log(this.Expenses);
          } else {
            this.Expenses = 0;
          }
          if (this.listofStatements[i].type === 'INCOME') {
            this.Incomes = this.Incomes + this.listofStatements[i].amount;
          }
          else {
            this.Incomes = 0;
          }

        }
      } else {
        this.listofStatements = [];
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }

}
