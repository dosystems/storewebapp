import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordValidator, phoneValidator,matchingPasswords } from '../../validators';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  totalSubscribers:any = [];
  serverUrl:any = 'subscriptions';
  totalRecords:number;
  subscribeForm:FormGroup;
  Id:any;
  ExportCsv:any = [];
  
  constructor( public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute ) {
     }

  ngOnInit() {
 }

  // Get Total Subscribers
  getTotalSubscriber(event?:any){
    let URL;
    let filterCriteria;
    let filterLabels = ['planName','actualAmount', 'startDate', 'duration', 'endDate', 'sellerName','created','createdBy.name','email','phone'];
    if (event && event.filters && event.filters.hasOwnProperty('duration')) {
      event.filters.duration.searchFormatType = "Number";
    }
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get',URL,'').subscribe(res => {
       if(res && res.subscriptions){
         this.totalSubscribers =  res.subscriptions;
        for (let i = 0; i < this.totalSubscribers.length; i++) {
          if (event && event.first) {
            this.totalSubscribers[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalSubscribers[i].srNo = i + 1;
          }

        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }       
        this.appService.loaderStatus('none');   
       } else {
         this.totalSubscribers = [];
         this.appService.loaderStatus('none');
         this.appService.displayToasterMessage(res.errorMessage);
      }
    },(error)=>{
       this.appService.loaderStatus('none');
       this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }
   
   //On Click Actions
   onClickActions(type?:any,data?:any){
       var rowData = JSON.parse(JSON.stringify(data));
        this.Id = rowData._id;
       if(type === 'delete'){
         $('#delete').modal({ backdrop: 'static', keyboard: false },'show');
       }
   }
   //Delete subscriber 
    deleteSubscriber(){
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#delete').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalSubscriber();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });       
    }
}
