import { Component } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { AppService } from "../app.service";
import { AppConfig } from '../app.config';
@Component({
  selector: 'ross-merchant-details',
  templateUrl: './merchant-details.component.html',
  styleUrls: ['./merchant-details.component.css']
})
export class MerchantDetailsComponent {
  merchantDetails:any={};
  constructor( public appService:AppService ,public route:ActivatedRoute,public appConfig:AppConfig ) {
    route.params.subscribe(params => {
      let merchantId = params['id'];
      this.getMerchantDetails(merchantId);
    });
   }

   // To get previous user addresses
   getMerchantDetails(id) {
    let url = 'sellers/' + id;
    this.appService.manageHttp('get', url, '')
      .subscribe((res) => {
        if (res.details) {
          this.merchantDetails = res.details;
        } else {
          this.merchantDetails = {};
        }
      });
  }

}
