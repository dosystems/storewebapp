import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-userdetails',
  templateUrl: './userdetails.component.html',
  styleUrls: ['./userdetails.component.scss']
})
export class UserdetailsComponent implements OnInit {
  userId: any;
  buyerDetails: any = {};
  Address:any = {};
  userHistory: any = [];
  totalRecords: any;
  pageNumber: any;
  buxUser:any = {};
  showHistoryTable:boolean = true;
  constructor(public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) {
    activeRoute.params.subscribe(p => { this.userId = p['id'] });
    if (this.userId) {
      this.getBuyerDetailsById(this.userId);
    }
  }

  ngOnInit() {
  }

  getBuyerDetailsById(id){
    this.appService.manageHttp('get','buyers' + '/' + id,'').subscribe(res =>{
      if(res && res.details){
          this.buyerDetails = res.details;
      } else {
        this.buyerDetails = {};
      }
    },(error)=>{
      this.toastr.error("Merchant Doesn't Exist");
    });
  }

  //User History and For Pagination
  getUserHistory(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = [ 'name','userEmail' ];
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
     filterCriteria.criteria.push({ "key": "contextId", "value": this.userId, "type": "in" });
    URL = 'activities' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.activities && res.activities.length && res.activities.length > 0) {        
        this.userHistory = res.activities;
        this.showHistoryTable = true;
        for (let i = 0; i < this.userHistory.length; i++) {
          if(event && event.first){
           this.userHistory[i].srNo = (i + 1) + event.first;
         }
         else{
           this.userHistory[i].srNo = i+1;
         }
          if (this.userHistory[i].created) {
            this.userHistory[i].created = moment(this.userHistory[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }        
        // this.toastr.show(res.respMessage);
      }
      else {
        this.userHistory = [];
        this.showHistoryTable =false;
      }
    }, (error)=> {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');    
    });
  }

}
