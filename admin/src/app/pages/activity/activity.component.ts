import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  serverUrl = 'activities';
  totalActivities: any = [];
  totalRecords: any;
  exportCsv: any = [];
  employeeData :any ={};
  constructor(public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService,public router:Router) {

  }

  ngOnInit() {
    //export csv 
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Context ', field: 'context' },
      { header: 'ContextType', field: 'contextType' },
      { header: 'Description', field: 'desc' },    
       { header: 'Created', field: 'created' },         
    ];
  }
  // get all the activities
  getAllActivitie(event?: any) {

    let filterCriteria;
    let filterLabels = [ 'context','contextType', 'desc', 'value', 'created'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }

    if (!filterCriteria) {
      return;
    }
    let URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.activities ) {

        this.totalActivities = res.activities;
        for (let i = 0; i < this.totalActivities.length; i++) {
          if (event && event.first) {
            this.totalActivities[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalActivities[i].srNo = i + 1;
          }

        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    })
  }
  
  //navigate to buyer or seller details
  BuyerorSeller(data){
    var activity = JSON.parse(JSON.stringify(data));
    if(activity.createdBy.employee){
      let id = activity.createdBy.employee._id;
      this.getEmployeeDetails(id);   
    } else if(activity.createdBy.buyer){
      this.router.navigate(['/details/Customer'], { queryParams: { id:activity.createdBy.buyer._id } });
    } else {
      this.router.navigate(['/details/Merchant'] ,{ queryParams: { id:activity.createdBy.seller._id } });
    }
  }
   
   //View Modal For Employee
   getEmployeeDetails(id){
     this.appService.manageHttp('get','employees' + '/' + id,'').subscribe(res => {
       if(res && res.details){
         this.employeeData = res.details;
         $('#viewEmployee').modal({ backdrop: 'static', keyboard: false },'show');
       } else{
         this.employeeData = [];
       }
     },(error)=>{
        this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
     });
   }
}
