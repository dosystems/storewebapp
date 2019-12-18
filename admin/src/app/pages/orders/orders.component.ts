import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare let $;


@Component({
  selector: 'az-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orderForm: FormGroup;
  orderData: any = {};
  orderDetails: any = {};
  totalOrders: any = [];
  exportCsv: any = [];
  Status: any = [];
  serverUrl = 'orders';
  totalRecords: any;
  submitted: boolean;
  orderId: any;
  productDetails: any = {};
  queryParamUserId: any;
  queryParamStatus: any;
  returnStatus: any = [];
  returnStatusCol: any;
  queryParamMultiStatus: any;
  queryParamPendingStatus: any;
  paidFrom: string;
  temporaryStatus: any = [];
  iter:any =0;

  constructor(public fb: FormBuilder, public activatedRoute: ActivatedRoute, public router: Router, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.queryParamUserId = this.activatedRoute.snapshot.queryParams["userId"];
    this.queryParamStatus = this.activatedRoute.snapshot.queryParams["status"];
    this.queryParamMultiStatus = this.activatedRoute.snapshot.queryParams["Status"];
    this.queryParamPendingStatus = this.activatedRoute.snapshot.queryParams["PendingStatus"];
    this.orderForm = fb.group({
      status: [''],
      notes: ['']
    });
  }

  ngOnInit() {

    /* Export CSV*/
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Product ', field: 'entityName' },
      { header: 'Seller', field: 'ownerName' },
      { header: 'Buyer', field: 'userName' },
      { header: 'Status', field: 'status' },
      { header: 'Price', field: 'inventory.Price' },
      { header: 'Size', field: 'inventory.Size' },
      { header: 'Color', field: 'inventory.Color' },
      { header: 'Created', field: 'created' },
      { header: 'CreatedBy', field: 'createdBy.user.userName' }
    ]
    /*DropDown For Status*/
    this.Status = [
      { label: 'All', value: null },
      { label: 'AddToCart', value: 'AddToCart' },
      { label: 'Paid', value: 'Paid' },
      { label: 'Processing', value: 'Processing' },
      { label: 'Shipped', value: 'Shipped' },
      { label: 'Delivered', value: 'Delivered' },
      { label: 'Returned', value: 'Returned' },
      { label: 'Cancelled', value: 'Cancelled' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Refunded', value: 'Refunded' }
    ]
    //For Return Status
    this.returnStatus = [
      { label: 'All', value: null },
      { label: 'Requested', value: 'ReturnRequest' },
      { label: 'Picked up', value: 'PickedUp' },
      { label: 'Processing', value: 'Processing' },
      { label: 'Returned', value: 'Returned' },
    ]
    this.returnStatusCol = this.returnStatus.slice(1);
  }



  getAllOrders(event?: any) {
    let filterCriteria;
    let filterLabels = ['quantity', 'ownerName', 'userName', 'entityName', 'status', 'currencies.USD','currencies.BUX', 'inventory.Price', 'created'
      , 'createdBy.name', 'deliveryDays', 'deliveryDate','BUX'];
    if (event && event.filters && event.filters.hasOwnProperty('deliveryDays')) {
      event.filters.deliveryDays.searchFormatType = "Number";
    }
    if (event && event.filters && event.filters.hasOwnProperty('quantity')) {
      event.filters.quantity.searchFormatType = "Number";
    }
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }

    if (!filterCriteria) {
      return;
    }
    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }

    if (this.queryParamUserId) {
      filterCriteria['criteria'].push({
        "key": "userId", "value": this.queryParamUserId, "type": "eq"
      });
    }
    if (this.queryParamStatus) {
      filterCriteria['criteria'].push({
        "key": "status", "value": this.queryParamStatus, "type": "eq"
      });
    }
    if (this.queryParamMultiStatus) {
      filterCriteria['criteria'].push({
        "key": "status", "value": ['Paid', 'Delivered', 'Processing', 'Shipped'], "type": "eq"
      });
    }
    if (this.queryParamPendingStatus) {
      filterCriteria['criteria'].push({
        "key": "status", "value": ['Paid', 'Processing', 'Shipped'], "type": "eq"
      });
    }

    if (!event || (event && !event.filters) || (event && event.filters && !event.filters.status) && !this.queryParamPendingStatus 
               &&  !this.queryParamMultiStatus && !this.queryParamStatus && !this.queryParamUserId ) {
      filterCriteria['criteria'].push({ "key": "status", "value":"AddToCart", "type": "ne" });
    }

    let URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.orders) {
        this.totalOrders = res.orders;
        for (let i = 0; i < this.totalOrders.length; i++) {
          if (event && event.first) {
            this.totalOrders[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalOrders[i].srNo = i + 1;
          }
          if (this.totalOrders[i].created) {
            this.totalOrders[i].created = moment(this.totalOrders[i].created).format(this.appConfig.userFormat);
          }
          if (this.totalOrders[i].payments) {
            if (this.totalOrders[i].payments.paypal) {
              this.paidFrom = "Paypal";
            } else if (this.totalOrders[i].payments.bitsolives) {
              this.paidFrom = "BitSolives";
            } else {
              this.paidFrom = "Wallet";
            }
          } else {
            this.paidFrom = "";
          }
          this.totalOrders[i].paymentType = this.paidFrom;
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalOrders = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  //end of get call


  onClickActions(type, rowData) {
    let tempd = JSON.parse(JSON.stringify(rowData));
    this.orderId = tempd._id;
    //Navigate to Orderdetails
    if (type === 'details') {
      this.router.navigate(['/details/Order'], { queryParams: { id: this.orderId } });
    }
    //edit Modal
    if (type === 'edit') {
      this.orderData = tempd;
      if (this.orderData.status === 'Cancelled') {
        this.temporaryStatus = this.Status.slice(6);
      } else {
        this.temporaryStatus = this.Status.slice(1);
      }
      this.orderData.notes = '';
      $('#AddorEdit').modal('show');
    }
    //Delete modal
    if (type === 'delete') {
      this.orderData = tempd;
      $('#deleteOrder').modal('show');
    }

  }

  // For update The Order Status
  updateOrder(data?:any) {
    var orderData;
    if(data){
      orderData = data;
    } else if(this.orderForm.status === 'VALID'){
       orderData = this.orderForm.value;
    }
    this.appService.loaderStatus('block')
    this.appService.manageHttp('put', this.serverUrl + '/' + this.orderId,orderData).subscribe(res => {
      if (res && res.respCode === 205) {
        this.appService.displayToasterMessage(res.respMessage);
        $('#AddorEdit').modal('hide');
        this.getAllOrders();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  }

  // For Deleting the Order
  deleteOrder() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.orderId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.appService.displayToasterMessage(res.respMessage);
        $('#deleteOrder').modal('hide');
        this.getAllOrders();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    })
  }

  ///Return Stattus
  updateReturnStatus(data, id) {
    this.orderData = {};
    this.orderId = id;
    this.orderData['returnStatus'] = data;
    this.updateOrder(this.orderData);   
  }

}

