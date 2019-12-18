

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../app.config';
import { AppService } from '../app.service';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'ross-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  products:any;
  totalRecords:any;
  orders:any=[];
  orderId:any;
  totalPrice:any;
  constructor( public appService:AppService, public appConfig:AppConfig,public toasterService:ToastrService ) {
    this.getAllOrders();
   }

  ngOnInit() {
  }

 getAllOrders() {
  this.totalPrice='';
    // this.appService.loaderStatus('block');
    this.appService.getOrdersList('AddToCart').subscribe(res => {
      if (res && res.respCode==this.appService.respCode200) {
        this.orders = res.orders;
        for (let i = 0; i < this.orders.length; i++) {
          if (this.orders[i].created) {
            this.orders[i].created = moment(this.orders[i].created).format(this.appConfig.userFormat);
          }
          if (this.orders[i].inventory.price) {
            this.totalPrice= Number(this.totalPrice)+ (Number(this.orders[i].inventory.price)*Number(this.orders[i].quantity));
          }     
        }
        // this.totalRecords = res.pagination.totalCount;
      } else {
        this.toasterService.error(res.respMessage);
       
      }
    }, (error) => {
      this.toasterService.error('went something wrong');
      
    })
  }



  // to open delete order pop up

  ShowDeleteModel(orderId,deleteOrder){
    this.orderId= orderId;
    $('#'+deleteOrder).appendTo("body").modal('show');
  }



  // to delete order
  deleteOrder(orderId){
    this.appService.manageHttp('delete','orders' + '/' +orderId ,'').subscribe(res => {
     if (res && res.respCode === 206) {
       this.toasterService.success(res.respMessage);
       $('#deleteOrder').modal('hide');
       this.getAllOrders();
     }
     else if (res && res.respCode === 9001){
        this.toasterService.error(res.respMessage);
      }
    },(error)=>{
       this.toasterService.error(' something went wrong');
    })
  }



}
