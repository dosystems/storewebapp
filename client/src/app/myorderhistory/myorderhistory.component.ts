import { Component,OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import { AppService } from '../app.service';
import * as moment from 'moment/moment';
declare var $;
@Component({
  selector: 'ross-myorderhistory',
  templateUrl: './myorderhistory.component.html',
  styleUrls: ['./myorderhistory.component.css']
})
export class MyorderhistoryComponent implements OnInit {
  orders: any = [];
  orderId: any;
  noOrders: boolean = false;
  disableButton: boolean = false;
  orderType: any;
  pageNumber: any = 1;
  totalRecords: any;
  pages: any;
  constructor(public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) { }

  ngOnInit() {
    this.getAllOrders();
  }



   // to get All orders
   getAllOrders() {
    this.appService.loaderStatus('block');
    var URL = 'Orders?filter={"page": "' + this.pageNumber + '", "limit": "' + this.appConfig.ordersPerPage + '","sortfield":"created","direction":"desc","criteria":[{ "key": "userId", "value": "' + this.appService.loginEmpDetails._id + '","type": "eq" },{ "key":"status" , "value":"AddToCart" , "type":"ne"}]}';
    this.appService.manageHttp('get', URL, '').subscribe(res => {

      if (res && res.orders && res.orders.length > 0) {
        this.orders = res.orders;
        for (let i = 0; i < this.orders.length; i++) {
          if (this.orders[i].created) {
            this.orders[i].created = moment(this.orders[i].created).format(this.appConfig.userFormat);
          }
        }
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
    }, (error) => {
      this.orders = [];
      this.toastr.error('something went  wrong');
      this.appService.loaderStatus('none');
    })
  }

  // to show return return or cancel order
  showreturnOrCancelOrderModel(type, returnOrCancel, orderId) {
    this.orderType = type;
    this.orderId = orderId;
    $('#' + returnOrCancel).appendTo("body").modal('show');
  }



  // to return or cancel order
  returnOrCancelOrder(orderId, type) {
    this.disableButton = true;
    let order: any = {};
    if (type == 'return') {
      order.status = "Returned";
    } else if (type == 'cancel') {
      order.status = "Cancelled";
    }

    this.appService.manageHttp('put', `orders/${orderId}`, order)
      .subscribe(res => {
        if (res && res.respCode && res.respCode === 205) {
          $('#returnOrCancel').modal('hide');
          this.toastr.success(res.respMessage);
          this.getAllOrders();
        } else {
          this.toastr.error(res.errorMessage);
        }
        this.disableButton = false;
      }, (error) => {
        this.toastr.error(' something went wrong');
        this.disableButton = false;
      });
  }



  // on page change
  paginate(event) {
    this.pageNumber = event.page + 1;
    this.getAllOrders();
  }

}
