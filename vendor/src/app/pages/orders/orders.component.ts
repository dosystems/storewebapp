import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
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
  retutnStatus:any;
  orderType: any;
  retutnStatusCol:any;
  productDetails: any = {};
  orderCallType:any;
  paidFrom:string;
  queryParamStatus:string;
  iter:any=0;
  constructor(public fb: FormBuilder, public router: Router, public appService: AppService, public appConfig: AppConfig,
    public toastr: ToastrService, public activatedRoute: ActivatedRoute) {
    this.orderForm = fb.group({
      status: [''],
      notes: [''],
      returnStatus:['']
    });
    this.queryParamStatus = this.activatedRoute.snapshot.queryParams["status"];
    this.orderType = this.activatedRoute.snapshot.queryParams["type"];
   // this.orderType = this.activatedRoute.snapshot.queryParamMap.get('type');
    let routUrl = this.router.url.split('/');
    if(routUrl && routUrl[2]){
      this.orderCallType = routUrl[2];
      console.log(this.orderCallType);
    }

  }

  ngOnInit() {

    /* Export CSV*/
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Product ', field: 'entityName' },
      { header: 'Owner', field: 'ownerName' },
      { header: 'Status', field: 'status' },
      { header: 'Price', field: 'inventory.price' },
      { header: 'Size', field: 'inventory.size' },
      { header: 'Color', field: 'inventory.color' }
    ]
    /*DropDown For Status*/
    this.Status = [
      { label: 'All', value: null },
      { label: 'Add to cart', value: 'AddToCart' },
      { label: 'Paid', value: 'Paid' },
      { label: 'Processing', value: 'Processing' },
      { label: 'Shipped', value: 'Shipped' },
      { label: 'Delivered', value: 'Delivered' },
      { label: 'Returned', value: 'Returned' },
      { label: 'Cancelled', value: 'Cancelled' },
      { label: 'Completed', value: 'Completed' },
    ];
    this.retutnStatus = [
      { label: 'All', value: null },
      { label: 'Requested', value: 'ReturnRequest' },
      { label: 'Picked up', value: 'PickedUp' },
      { label: 'Processing', value: 'Processing' },
      { label: 'Returned', value: 'Returned' },
    ]
    this.retutnStatusCol = this.retutnStatus.slice(1);
  }


  getAllOrders(event?: any) {
    let filterCriteria;
    let filterLabels = ['ownerName', 'entityName','returnStatus', 'userName', 'status', 'quantity', 'inventory.Color', 'inventory.Price','currencies.USD','currencies.BUX', 'created', 'createdBy.user'];
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
    if (filterCriteria && !filterCriteria.criteria) {
      filterCriteria.criteria = [];
    }
    if (this.orderType) {
      if (this.orderType == 'shipped') {
        filterCriteria.criteria.push({ "key": "status", "value": ['Shipped','Delivered'], "type": "eq" })
      }
    }
    if(this.orderCallType){
      if(this.orderCallType == 'returned'){
        filterCriteria.criteria.push({ "key": "returnStatus", "value": ['ReturnRequest','PickedUp','Processing','Returned'], "type": "eq" })
      }
    }
    if(this.queryParamStatus){
     filterCriteria['criteria'].push({
        "key": "status", "value": this.queryParamStatus, "type": "eq"
      });
    }
    if (!event || (event && !event.filters) || (event && event.filters && !event.filters.status) && !this.orderType
         && !this.queryParamStatus && this.orderCallType != 'returned' ) {
       filterCriteria['criteria'].push(
          { "key": "status", "value":"AddToCart", "type": "ne" });
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
          if(this.totalOrders[i].payments){
             if(this.totalOrders[i].payments.paypal){ 
               this.paidFrom = "Paypal";
             } else if(this.totalOrders[i].payments.bitsolives){
               this.paidFrom = "BitSolives";
             } else {
               this.paidFrom = "Wallet";
             }
          } else{
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
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }

  //end of get call


  onClickActions(type, rowData) {
    let tempd = JSON.parse(JSON.stringify(rowData));
    this.orderId = tempd._id;
    //Navigate to Orderdetails
    if (type === 'details') {
      this.router.navigate(['/details/Order'],{ queryParams:{ id:this.orderId }});
    }

    //edit Modal
    if (type === 'edit') {
      this.orderData = {};
      this.orderData.status = tempd.status;
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
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.orderId, this.orderData).subscribe(res => {
      if (res && res.respCode === 205) {
        this.toastr.success(res.respMessage);
        $('#AddorEdit').modal('hide');
        this.getAllOrders();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }

  // For Deleting the Order
  deleteOrder() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.orderId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.toastr.success(res.respMessage);
        $('#deleteOrder').modal('hide');
        this.getAllOrders();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }

 //For updating Return Status
  updateReturnStatus(data,id){
   this.orderData = {};
   this.orderId = id;
   this.orderData['returnStatus'] = data;
   this.updateOrder();   
  }

}

