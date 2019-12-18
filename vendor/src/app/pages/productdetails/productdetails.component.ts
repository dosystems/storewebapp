import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare var $; 

@Component({
  selector: 'az-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.scss']
})
export class ProductdetailsComponent  {
  productData:any = {};
  productId:any;
  imagesPath = this.appConfig.imageUrl + 'entity/';
  objectKeys = Object.keys;
  entityType:string;

  constructor(public router: Router, public appService: AppService, public activatedroute: ActivatedRoute, public appConfig: AppConfig, public toastr: ToastrService) {
     activatedroute.queryParams.subscribe(p => { this.productId = p['id'] });
     if(this.productId){
       this.getLocalStorageData();
       this.getProductDetails(this.productId);
     }
   }

   //get Product Details
   getProductDetails(id){
     var type = '?loginType=' + this.entityType;
    this.appService.manageHttp('get', 'entities' + '/' + id + type , '').subscribe(res => {
      if (res && res.details) {
        this.productData  = res.details;
        if (this.productData.inventories && this.productData.inventories.length > 0) {
          for (var i = 0; i < this.productData.inventories.length; i++) {
            delete this.productData.inventories[i].MRPCurrency;
            delete this.productData.inventories[i].Currency;
          }
        }

      } else {
        this.productData = [];
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
   }

    //Get Local storage
    getLocalStorageData() {
        if (localStorage.getItem('entityType')) {
            this.entityType = localStorage.getItem('entityType');
        }
    }

}
