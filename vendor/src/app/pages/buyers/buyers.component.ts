import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordValidator, phoneValidator } from '../../validators';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-buyers',
  templateUrl: './buyers.component.html',
  styleUrls: ['./buyers.component.scss']
})
export class BuyersComponent implements OnInit {
  serverUrl = 'sellers/getBuyersList';
  totalBuyersList = [];
  totalRecords: any;
  Id: any;
  buyerForm: FormGroup;
  buyerData: any = {};
  submitted: boolean;
  pageName: string;
  exportCsv:any=[];
  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) {
    this.buyerForm = fb.group({
      firstName: ['',Validators.required],
      lastName: ['',Validators.required],
      email: ['',Validators.compose([Validators.required, emailValidator])],
      phoneNumber: ['',Validators.required]
    });
  }

  ngOnInit() {
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'FirstName ', field: 'firstName' },
      { header: 'LastName', field: 'lastName' },
      { header: 'Email', field: 'email' },
      { header: 'Gender', field: 'gender' },
      { header: 'Phone', field: 'phoneNumber' },
      { header: 'Status', field: 'status' },
      { header: 'Bux Tradable', field: 'wallet.BUX' },
      { header: 'Eur Tradable', field: 'wallet.EUR' },
      { header: 'Created', field: 'created' }
    ];
  }
  //get call for Buyer Sellers
  getBuyersList(event?: any) {
    let URL;
    let filterCriteria;
   let filterLabels = ['firstName','userName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'];
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
    URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.buyers) {
        this.totalBuyersList = res.buyers;
        for (let i = 0; i < this.totalBuyersList.length; i++) {
          if (event && event.first) {
            this.totalBuyersList[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalBuyersList[i].srNo = i + 1;
          }
          if (this.totalBuyersList[i].created) {
            this.totalBuyersList[i].created = moment(this.totalBuyersList[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalBuyersList = [];
        this.appService.loaderStatus('none');
        this.toastr.error(res.errorMessage);
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });

  } //end of get call

  //CLickActions 
  onClickActions(type, data) {    
    var rowData = JSON.parse(JSON.stringify(data));
    this.Id = rowData._id;
    if (type === 'details') {      
      this.router.navigate(['/userdetails/' + rowData._id]);
    } else if (type === 'edit') {
      $('#editBuyer').modal('show');
      this.buyerData = {};
      this.submitted = false;     
      this.buyerData = rowData;
    } else if (type === 'delete') {
      $('#deleteBuyer').modal('show');
    }
  }


  //Update Call 
  UpdateBuyer(buyerData) {
    if (this.buyerForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.Id, buyerData).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#editBuyer').modal('hide');
        this.toastr.success(res.respMessage);
        this.getBuyersList();
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }

  // Delete Call
  deleteBuyer() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#deleteBuyer').modal('hide');
        this.toastr.success(res.respMessage);
        this.getBuyersList();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }

  

}




