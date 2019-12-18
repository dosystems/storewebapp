import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordValidator, phoneValidator, matchingPasswords } from '../../validators';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
declare let $;

@Component({
  selector: 'az-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss']
})
export class SellersComponent implements OnInit {
  sellerForm: FormGroup;
  resetForm: FormGroup;
  totalSellersList: any = [];
  serverUrl = 'sellers';
  totalRecords: number;
  submitted: any = false;
  sellerData: any = {};
  Id: any;
  ExportCsv: any = [];
  Status: any = [];
  resetPwd: any = {};
  brands:any = [];
  categories:any = [];
  Category:any = {} ;
  Brand:any ={} ;
 exportFileCount:any = 0;
 type:string;
 accessStatus:any;
  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public activeRoute: ActivatedRoute) {
    this.sellerForm = fb.group({
      companyName: ['', Validators.required],
      displayName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phoneNumber: ['', Validators.required],
     // outlets:[''],
      website:[''],
      location:['',Validators.required]
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
     { label: 'Blocked', value: 'Blocked' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Verified', value: 'Verified' },
      { label: 'NotVerified', value: 'NotVerified' }
    ]
  }
  // For Click Actions
  onClickActions(type: any, data) {
    this.submitted = false;
    var rowData = JSON.parse(JSON.stringify(data));
    this.Id = rowData._id;
    if (type === 'edit') {
      this.sellerForm.reset();
      this.getSellerById(this.Id);
    } else if (type === 'delete') {
      $('#deleteSeller').modal({ backdrop: 'static', keyboard: false },'show');
    } else if (type === 'ResetPwd') {
      this.resetForm.reset();
      $('#ResetPassword').modal({ backdrop: 'static', keyboard: false },'show');
    }else if (type === 'Block') {
      this.type=type;
      this.accessStatus='Blocked';
      $('#BlockOrActivateSeller').modal({ backdrop: 'static', keyboard: false },'show');
    } else if (type === 'Approve') {
      this.type=type;
      this.accessStatus='Verified';
      $('#BlockOrActivateSeller').modal({ backdrop: 'static', keyboard: false },'show');
    } 
  }


  blockOrActivateUser(type){
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.Id+'?type='+type,this.sellerData ).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#BlockOrActivateSeller').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalSellersList();
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });
  }

  //Get By Id For Buyer Details
  getSellerById(id) {
    this.appService.manageHttp('get', this.serverUrl + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.sellerData = res.details;
        this.Category ={'tree': this.sellerData.productCategory};
        this.Brand = { 'name':this.sellerData.brand };
        $('#addOrEdit').modal({ backdrop: 'static', keyboard: false },'show');
      } else {
        this.sellerData = {};
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage("Seller Doesn't Exist", 'error');
    });
  }

  // Get List
  getTotalSellersList(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['firstName', 'lastName', 'email', 'phoneNumber', 'gender', 'status', 'created','companyName','displayName'];
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
      }
      if (res && res.sellers && res.sellers.length && res.sellers.length > 0) {
        this.totalSellersList = res.sellers;
        this.totalSellersList.forEach((seller, index) => {
          if (event && event.first) {
            seller.srNo = (index + 1) + event.first;
          }
          else {
            seller.srNo = index + 1;
          }
        });

        this.appService.loaderStatus('none');
      } else {
        this.totalSellersList = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });
  }

  //Update Call 
  UpdateSeller() {
    if(this.Category && this.Category.tree ){
       this.sellerData.productCategory = this.Category.tree;
    } else {
      this.sellerData.productCategory = '';
    }
    if(this.Brand && this.Brand.name){
      this.sellerData.brand = this.Brand.name;
    }  else {
      this.sellerData.brand = '';
    }    
    if (this.sellerForm.status === 'INVALID'  || !this.sellerData.productCategory || !this.sellerData.brand ) {
      this.submitted = true;
      return;
    }
    delete this.sellerData._id;
    delete this.sellerData.updated;
    delete this.sellerData.created;
    delete this.sellerData.active;
    delete this.sellerData.status;
    delete this.sellerData.isSubscribed;
    delete this.sellerData.lastActivity;
    delete this.sellerData.bussinessVolume;  
    this.sellerData.companyName = this.appService.capitalize(this.sellerData.companyName);
    this.sellerData.displayName = this.appService.capitalize(this.sellerData.displayName);
    this.sellerData.location = this.appService.capitalize(this.sellerData.location);

    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', this.serverUrl + '/' + this.Id,this.sellerData ).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#addOrEdit').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalSellersList();
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });
  
  }

  //Delete call For seller
  deleteSeller() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#deleteSeller').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalSellersList();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
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
    this.resetPwd.type = 'seller';
    let resetUrl = 'auth/resetPassword';
    this.appService.loaderStatus('block');
    this.appService.manageHttp('post', resetUrl, this.resetPwd).subscribe(res => {
      if (res && res.respCode === 200) {
        $('#ResetPassword').modal('hide');
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalSellersList();
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');      
    });
  }
  //ResetPassword For Buyer From Admin  
    
    //Search Brands For AutoComplete
    searchBrands(event){
    if (event && event.query) {
      let filter = { "sortfield": "created", "direction": "desc", "criteria": [{ "key": "name", "value": event.query, "type": "regexOr" }] }
      var URL = 'brands' + '?filter=' + JSON.stringify(filter);
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res && res.brands  ) {
          this.brands = res.brands;
        } else {
           this.brands = [];
           this.appService.displayToasterMessage(res.errorMessage);
        }
      },(error)=>{
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');      
      });
    }
  }
  //Search Brands For AutoComplete

 // To get all the categories list for auto suggestion
  getAllCategories(event: any) {
    if (event && event.query) {
      let filter = { "sortfield": "created", "direction": "desc", "criteria": [{ "key": "tree", "value": event.query, "type": "regexOr" }] }
      var URL = 'categories' + '?filter=' + JSON.stringify(filter);
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.categories = res.categories;
        } else {
          this.categories = [];
          this.appService.displayToasterMessage(res.errorMessage);
        }
      },(error)=>{
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');      
      });
    }
  }
  // To get all the categories list for auto suggestion

  exportCSV(){
    this.appService.loaderStatus('block');
    var Url = 'sellers';
    this.appService.manageHttp('get', Url, '').subscribe(res =>{
      if(res && res.sellers && res.sellers.length > 0){
        for(var i=0;i<res.sellers.length;i++){
               if(res.sellers[i].created){
                 res.sellers[i].created = this.appService.getDisplayDateFormat(res.sellers[i].created);
               }
        }
        let filterLabels = [ 'firstName','lastName','email','phoneNumber','status','created' ];
         var data = this.appService.handleNull(res.sellers);
         this.exportFileCount += 1;
         this.appService.exportToCSV(data, filterLabels, 'Withdrawals', this.exportFileCount, '');
         this.appService.loaderStatus('none');
      } else{
            this.appService.loaderStatus('none');
      }
    })
  }




}
