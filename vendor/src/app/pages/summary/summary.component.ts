import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  Type:any;
  loginVendorid:any;
  totalRecords:number;
  Vendorstatements;any =[];
  exportCsv:any;
  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) { 
        activeRoute.params.subscribe(p => { this.Type = p['type'] });
        this.appService.getLocalStorageData();
    }

  ngOnInit() {
    this.getVendorStatments();
  }
    //Get Local Storage
    getLocalStorageData() {
        if (localStorage.getItem('vendor')) {
            let vendor = JSON.parse(localStorage.getItem('vendor'));
            if (vendor && vendor.vendor && vendor.vendor._id) {
                this.loginVendorid = vendor.vendor._id;
            }
          
        }
    } //End Of Local Storage

    //Get Statoemnts For payement Sumary
    getVendorStatments(event?:any){
    let URL;
    let filterCriteria;
    let filterLabels = [ 'amount','type','userName','created' ];
    filterCriteria = this.appService.EventData(event, filterLabels);
      if (filterCriteria == 'invalidData') {
        return;
      }
      if (!filterCriteria) {
        return;
      }    
      if(!filterCriteria.criteria){
        filterCriteria.criteria = [];
      } 
       filterCriteria.criteria.push({ "key": "userId", "value": this.appService.loginVendorDetails._id, "type": "in" },
       { "key": "type", "value": "INCOME", "type": "in" });
        URL = 'statements?filter=' + JSON.stringify(filterCriteria);       
       this.appService.loaderStatus('block');
       this.appService.manageHttp('get', URL, '').subscribe(res => {
       if (res) {
         if (res.pagination && res.pagination.totalCount) {
           this.totalRecords = res.pagination.totalCount;
         }
         if (res.statements && res.statements.length && res.statements.length > 0) {
            this.Vendorstatements = res.statements;
            this.Vendorstatements.forEach((Vendorstatements, index) => {
            if (event && event.first) {
              Vendorstatements.serialNo = (index + 1) + event.first;
            } else {
              Vendorstatements.serialNo = (index + 1);
            }
          });
        } else {
          this.Vendorstatements = [];
        }
      }
      this.appService.loaderStatus('none');
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    })



    }  

}
