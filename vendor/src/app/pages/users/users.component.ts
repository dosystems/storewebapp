import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
 serverUrl:any = 'userDetails';
 totalUsers:any = [];
 totalRecords:any;
 userId:any = {};
 Type:any = [];
 columns:any;
 details:any = {};
  constructor( public router:Router,public appConfig: AppConfig, public appService: AppService, 
    public toastr: ToastrService, public activeRoute: ActivatedRoute  ) {
    
     }

  ngOnInit() {
    this.Type = [
      { label:'All' , value:null },
      { label:'Customer' , value:'isBuyer'  },
      { label:'Merchant' , value:'isSeller' }
    ]
  }

  // For Actions of Details and Delete
  onClickActions(type,rowData){
    var data = JSON.parse(JSON.stringify(rowData));
    if(type === 'details'){
       this.router.navigate(['/userdetails/' + rowData.userId]);
    }
    if(type === 'delete'){
      this.userId = data._id;
      $('#deleteUser').modal('show');
    }
  }

// For getting all the users
  getAllUsersDetails(event?:any){
  let filterCriteria;
      let filterLabels = [ 'isBuyer','isSeller' ];
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
      if (res && res.userDetails) {
        this.totalUsers = res.userDetails;
        for (let i = 0; i < this.totalUsers.length; i++) {
         if(event && event.first){
           this.totalUsers[i].srNo = (i + 1) + event.first;
         }
         else{
           this.totalUsers[i].srNo = i+1;
         }
          if (this.totalUsers[i].created) {
            this.totalUsers[i].created = moment(this.totalUsers[i].created).format(this.appConfig.userFormat);
          }          
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }   
        this.appService.loaderStatus('none');
      } else {
        this.totalUsers = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })    
  }

//For Deleting The User
  deleteUser(){
    this.appService.manageHttp('delete',this.serverUrl + '/' + this.userId,'').subscribe( res =>{
      if( res && res.respCode === 206 ){
       this.toastr.success(res.respMessage);
       $('#deleteUser').modal('hide');
       this.getAllUsersDetails();
       this.appService.loaderStatus('none');
     }
     else if (res && res.respCode === 9001){
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    },(error)=>{
       this.toastr.error('something went wrong');
       this.appService.loaderStatus('none');
    });
  }



}
