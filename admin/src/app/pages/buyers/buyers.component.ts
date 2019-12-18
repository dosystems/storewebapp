import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordValidator, matchingPasswords } from '../../validators';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
declare let $;

@Component({
  selector: 'az-buyers',
  templateUrl: './buyers.component.html',
  styleUrls: ['./buyers.component.scss']
})
export class BuyersComponent implements OnInit {
  serverUrl = 'buyers';
  totalBuyersList :any = [];
  totalRecords: any;
  Id: any;
  buyerForm: FormGroup;
  resetForm: FormGroup;
  buyerData: any = {};
  submitted: boolean;
  pageName: string;
  ExportCsv: any = [];
  Status: any = [];
  resetPwd: any = {};

  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public activeRoute: ActivatedRoute) {

    this.buyerForm = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phoneNumber: ['', Validators.required]
    });

    this.resetForm = fb.group({
      newPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      confirmPassword: ['', Validators.compose([Validators.required, passwordValidator])],
    }, { validator: matchingPasswords('newPassword', 'confirmPassword') });
  }

  ngOnInit() {
    this.ExportCsv = [
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
    this.Status = [
      { label: 'All', value: null },
      { label: 'Active', value: 'Active' },
      { label: 'Pending', value: 'Pending' }
    ]
  }
  //get call for Buyer Sellers
  getBuyersList(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['firstName', 'lastName', 'email', 'phoneNumber', 'gender', 'status', 'created'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res) {
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        if (res.buyers && res.buyers.length && res.buyers.length > 0) {
          this.totalBuyersList = res.buyers;
          this.totalBuyersList.forEach((buyer, index) => {
            if (event && event.first) {
              buyer.srNo = (index + 1) + event.first;
            }
            else {
              buyer.srNo = index + 1;
            }
          });
          this.appService.loaderStatus('none');
        } else {
          this.totalBuyersList = [];
          this.appService.loaderStatus('none');
        }
      }

    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });

  } //end of get call

  //CLickActions 
  onClickActions(type?: any, data?: any) {
    this.submitted = false;
    let rowData = JSON.parse(JSON.stringify(data));
    this.Id = rowData._id;
    if (type === 'edit') {
      this.buyerForm.reset();
      this.getBuyerById(this.Id);
    } else if (type === 'delete') {
      $('#deleteBuyer').modal('show');
    } else if (type === 'ResetPwd') {
      this.resetForm.reset();
      $('#ResetPassword').modal('show');
    }
  }

  //Get By Id For Buyer Details
  getBuyerById(id) {
    this.appService.manageHttp('get', this.serverUrl + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.buyerData = res.details;
        $('#editBuyer').modal('show');
      } else {
        this.buyerData = {};
        this.appService.displayToasterMessage(res.errorMessage, 'error');
      }
    }, (error) => {
      this.appService.displayToasterMessage("Buyer Doesn't Exist", 'error');
    });
  }


  //Update Call 
  UpdateBuyer() {
    if (this.buyerForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    this.buyerForm.value.firstName = this.appService.capitalize(this.buyerForm.value.firstName);
    this.buyerForm.value.lastName = this.appService.capitalize(this.buyerForm.value.lastName); 
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.Id, this.buyerForm.value).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#editBuyer').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getBuyersList();
        this.appService.loaderStatus('none');
      } else {
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }

  // Delete Call
  deleteBuyer() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#deleteBuyer').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getBuyersList();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage, 'error');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }

  //ResetPassword For Buyer From Admin
  resetPassword() {
    if (this.resetForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    this.resetPwd._id = this.Id;
    this.resetPwd.type = 'buyer';
    let resetUrl = 'auth/resetPassword';
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', resetUrl, this.resetPwd).subscribe(res => {
      if (res && res.respCode === 200) {
        $('#ResetPassword').modal('hide');
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.respMessage);
        this.getBuyersList();
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage, 'error');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }
  //ResetPassword For Buyer From Admin

}

