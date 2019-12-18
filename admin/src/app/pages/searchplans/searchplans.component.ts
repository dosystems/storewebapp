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
  selector: 'az-searchplans',
  templateUrl: './searchplans.component.html',
  styleUrls: ['./searchplans.component.scss']
})
export class SearchplansComponent implements OnInit {
  plansForm : FormGroup;
  planData :any = {};
  submitted:boolean;
  serverUrl:string = 'plans';
  totalSearchPlans:any = [];
  totalRecords:number;
  exportCsv:any = [];
  Id:any;
  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) { 
        this.plansForm = fb.group({
            name:['',Validators.required],
            duration:['',Validators.required],
            price:['',Validators.required],
            description:['']
        });
        this.getEditor();
    }

  ngOnInit() {
    this.exportCsv = [ 
      { header: 'S.No ', field: 'srNo' },
      { header: 'Price ', field: 'price' },
      { header: 'Name', field: 'name' },
      { header: 'Duration', field: 'duration' },
      { header: 'Description', field: 'decription' }      
    ]
  } 
 //Get Editor For SummerNote
  getEditor() {
    let that = this;
    $(function () {
      $('.summernote').summernote({
        height: 150,
        placeholder: 'Enter description',
        focus: true,
        toolbar: [
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontsize', ['fontsize']], // Still buggy
        ]
      });
    });
  }

 //Actions For  Crud
  onClickActions(type?:any,data?:any){
    var rowData = JSON.parse(JSON.stringify(data));
    this.Id = rowData._id;
    if(type === 'add'){
      this.planData = {};
      this.submitted = false;
      this.plansForm.reset();
      $('#AddOrEdit').modal({ backdrop: 'static', keyboard: false },'show');
    } else if(type === 'edit') {
      this.planData = rowData;
      $('#AddOrEdit').modal({ backdrop: 'static', keyboard: false },'show');
    } else if(type === 'view'){
      $('#viewPlan').modal({ backdrop: 'static', keyboard: false },'show');
    } else if(type === 'delete'){
      $('#delete').modal({ backdrop: 'static', keyboard: false },'show');
    }

  }

 
 // Create  Or Update 
  createOrUpdatePlan(plansForm){
      if(this.plansForm.status === 'INVALID'){
          this.submitted = true;
          return;
      }
       let method;
       let Url;
     //  plansForm.value.description = this.appService.formatEditorData($('#desc .note-editable')[0].innerHTML);
       if(this.planData._id){
         method = 'put';
         Url = this.serverUrl + '/' + this.planData._id;
       } else {
          method ='post';
           Url = this.serverUrl
       }
       if(plansForm.value.name){
         plansForm.value.name = this.appService.capitalize(plansForm.value.name);
       }
       this.appService.loaderStatus('none');
       this.appService.manageHttp(method,Url,plansForm.value).subscribe(res => {
      if (res && res.respMessage) {
        this.appService.displayToasterMessage(res.respMessage);
        $('#AddOrEdit').modal('hide');
        this.getAllSearchPlans();
        this.appService.loaderStatus('none');
      } else if(res && res.errorMessage){
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
       }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

//GEt All Search Plans
 getAllSearchPlans(event?:any){
    let filterCriteria;
      let filterLabels = [ 'price','name', 'duration', 'decription' ,'created'];
    if (event && event.filters && event.filters.hasOwnProperty('duration')) {
            event.filters.duration.searchFormatType = "Number";
        }       
      filterCriteria = this.appService.EventData(event,filterLabels);
      if(filterCriteria == 'invalidData'){
        return;
      }
    
    if (!filterCriteria) {
        return;
    }
    let URL = this.serverUrl +  '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.plans ) {
        this.totalSearchPlans = res.plans;
        for (let i = 0; i < this.totalSearchPlans.length; i++) {
         if(event && event.first){
           this.totalSearchPlans[i].srNo = (i + 1) + event.first;
         }
         else{
           this.totalSearchPlans[i].srNo = i+1;
         }
          if (this.totalSearchPlans[i].created) {
            this.totalSearchPlans[i].created = moment(this.totalSearchPlans[i].created).format(this.appConfig.userFormat);
          }         
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        } 
        this.appService.loaderStatus('none');
      } else {
        this.totalSearchPlans = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
 }

 deletePlan(){
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#delete').modal('hide');
        this.toastr.success(res.respMessage);
        this.getAllSearchPlans();
      } else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
 }
  
}
