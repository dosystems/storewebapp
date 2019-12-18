import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare let $;


@Component({
  selector: 'az-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss']
})
export class SellersComponent implements OnInit {
  serverUrl = 'userDetails';
  sellersList = [];
  totalRecords: any;
  pageNumber: any;
  sellerId: any;
  sellerForm: FormGroup;
  sellerData: any = {};
  selleraddress: any = {};
  submitted: boolean;
  addressId:any;

  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public toastr: ToastrService, public activeRoute: ActivatedRoute) {
    this.sellerForm = fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', Validators.required],
      state: ['', Validators.required],
      street: ['', Validators.required],
      zip: ['', Validators.required]
    });
  }

  ngOnInit() {
    //this.getSellersList(); 

  }
  //get call for Buyer
  getSellersList(event?: any) {
    let URL;
    if (event) {
      let currentPage: number = 1;
      if (event && event.first && event.rows) {
        currentPage = event.first / event.rows + 1;
      }
      if (currentPage === 1) {
        this.pageNumber = 0; // where am i using it ??
      }
      var filterCriteria = { "page": currentPage, "limit": event.rows, "sortfield": "created", "direction": "desc", "criteria": [{ "key": "isSeller", "value": true, "type": "in" }], };
      URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria) + '';
    }
    else {
      filterCriteria = {
        "page": 1, "limit": 20, "sortfield": "created", "direction": "desc", "criteria": [{ "key": "isSeller", "value": true, "type": "in" },
        { "key": "active", "value": true, "type": "in" }],
      };
      URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria) + '';
    }
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.userDetails) {
        this.sellersList = res.userDetails;
        for (let i = 0; i < this.sellersList.length; i++) {
          if (event && event.first) {
            this.sellersList[i].srNo = (i + 1) + event.first;
          }
          else {
            this.sellersList[i].srNo = i + 1;
          }
          if (this.sellersList[i].created) {
            this.sellersList[i].created = moment(this.sellersList[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.sellersList = [];
        this.appService.loaderStatus('none');
        this.toastr.error(res.respMessage);
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  } //end of get call

// On Click Action
  onClickActions(type, data) {
    var rowData = JSON.parse(JSON.stringify(data));
    if (type === 'details') {
      this.router.navigate(['/userdetails/' + rowData.userId]);
    } else if (type === 'edit') {
      $('#editSeller').modal('show');
      this.sellerId = rowData._id;
      this.sellerData = rowData;
      this.selleraddress = rowData.address[0];
      this.addressId=rowData.address[0]._id;
    } else if (type === 'delete') {
      this.sellerId = rowData._id;
      $('#deleteSeller').modal('show');
    }
  }

//Update Call 
  UpdateSeller(selleraddress) {
    if (this.sellerForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    selleraddress.operation = 1;
    selleraddress.id = this.addressId;
    let updateSeller = { "address": selleraddress };
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.sellerId, updateSeller).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#editSeller').modal('hide');
        this.toastr.success(res.respMessage);
        this.getSellersList();
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
        $('#editSeller').modal('hide');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });

  }

 //delete call
  deleteSeller() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.sellerId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#deleteSeller').modal('hide');
        this.toastr.success(res.respMessage);
        this.getSellersList();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
        $('#deleteSeller').modal('hide');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }

}
