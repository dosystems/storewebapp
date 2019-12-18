import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { emailValidator, phoneValidator } from '../../validators';
import { NavbarService } from '../../navbar.service';

declare var $: any;

@Component({
  selector: 'az-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit {
  myAccountForm: FormGroup;
  accountDetails: any = {};
  loginVendorId: any;
  categories: any;
  brands: any;
  imageUrlPath: any;
  submitted: boolean;
  countries: any = [];
  bankDetails: any = {};
  address: any = {};
  fileName:any;
  empty = "hellooo";


  constructor( public NavService:NavbarService, public appService: AppService, public appConfig: AppConfig, public formBuild: FormBuilder, public toastr: ToastrService, public http: HttpClient) {
    this.myAccountForm = this.formBuild.group({
      companyName: ['', Validators.required],
      //displayName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phoneNumber: ['', Validators.compose([Validators.required, phoneValidator])],
      productCategory: [''],
      brand: [''],
      website: [''],
      outlets: [''],
      shopTitle: ['', Validators.required],
      logo: [''],
      google: [''],
      facebook: [''],
      twitter: [''],
      storePolicy: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['', Validators.required],
      beneficiaryName: ['', Validators.required],
      bankName: ['', Validators.required],
      branch: ['', Validators.required],
      accountNumber: ['', Validators.required],
      IBAN: ['', Validators.required],
      swiftCode: ['', Validators.required]
    });
    this.getEditor();

    this.getLoginVendorId();
    this.getAccountDetails();
    this.accountDetails.socialMediaLinks = [];
    this.imageUrlPath = this.appConfig.imageUrl + 'seller/';

  }

  ngOnInit() {
  }

  // to get editor
  getEditor() {
    let that = this;
    $(function () {
      $('.summernote').summernote({
        height: 200,
        focus: true,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']], // Still buggy
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['view', ['fullscreen', 'codeview']],
          ['help', ['help']],
          ['misc', ['emoji']],
          ['insert', ['link', 'picture']]
        ]
      });
    });
  }

  // to get account details at start
  getAccountDetails() {
    this.appService.loaderStatus('block');
    this.submitted = false;
    this.appService.manageHttp('get', 'sellers/' + this.loginVendorId, '').subscribe(res => {
      if (res && res.details) {
        this.accountDetails = res.details;
        if (this.accountDetails.productCategory) {
          this.myAccountForm.controls.productCategory.setValue({ 'tree': this.accountDetails.productCategory });
        }
        if (this.accountDetails.brand) {
          this.myAccountForm.controls.brand.setValue({ 'name': this.accountDetails.brand });
        }
        if (this.accountDetails.storePolicy) {
          $('#description .note-editable')[0].innerHTML = this.accountDetails.storePolicy;
        }
        if (this.accountDetails.bankDetails) {
          this.bankDetails = this.accountDetails.bankDetails;
        }
        if (this.accountDetails.address) {
          this.address = this.accountDetails.address;
          if (this.address.country) {
            this.address.country = { "name": this.accountDetails.address.country };
          }

        }
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
      }
    })
  }



  //to get current user id
  getLoginVendorId() {
    if (localStorage.getItem('vendor')) {
      let vendor = JSON.parse(localStorage.getItem('vendor'));
      if (vendor && vendor.vendor && vendor.vendor._id) {
        this.loginVendorId = vendor.vendor._id;
      }
    }
  }

  //Function to update vendor account details
  updateAccountDetails() {
    if (this.myAccountForm && this.myAccountForm.status && this.myAccountForm.status == 'VALID') {

      delete this.accountDetails.products;
      delete this.accountDetails.lastActivity;
      delete this.accountDetails.noOfProducts;
      delete this.accountDetails.status;
      if (this.accountDetails && this.accountDetails.productCategory && this.accountDetails.productCategory) {
        this.accountDetails.productCategory = this.accountDetails.productCategory.tree;
      }
      if (this.accountDetails && this.accountDetails.brand && this.accountDetails.brand.name) {
        this.accountDetails.brand = this.accountDetails.brand.name;
      }
      if (this.bankDetails) {
        this.accountDetails.bankDetails = this.bankDetails
      }
      if ($('#description .note-editable') && $('#description .note-editable')[0] && $('#description .note-editable')[0].innerHTML) {
        this.accountDetails.storePolicy = $('#description .note-editable')[0].innerHTML;
      }
      if (this.address) {
        this.accountDetails.address = this.address;
        if (this.address.country && this.address.country.countryCode) {
          this.address.countryCode = this.address.country.countryCode;
        }
        if (this.address.country && this.address.country.name) {
          this.address.country = this.address.country.name;
        }
      }
      for(var details in this.accountDetails){
        if(details == 'companyName' || details == 'firstName' || details == 'lastName' || details == 'shopTitle' ||
        details == 'street' || details == 'city' || details == 'state'){
          this.accountDetails[details] = this.appService.capitalize(this.accountDetails[details]);
        }
      }
      this.appService.manageHttp('put', 'sellers/' + this.loginVendorId, this.accountDetails).subscribe(res => {
        if (res && res.respMessage) {
          this.toastr.success(res.respMessage);
          //localStorage.clear();
          this.setLocalStorage();
          this.getAccountDetails();
          //this.NavService.callComponentMethod();
        }
      })
    } else {
      this.submitted = true;
    }

  }

  //function to upload logo 
  uploadFile(event) {
    this.appService.fileUpload(event[0], 'file', 'sellers/uploadAttachments?id=' + this.loginVendorId + '&type=logo').subscribe(res => {
      if (res) {
        if (res.fileName) {
          this.accountDetails.logo = res.fileName;
        }
        this.appService.loaderStatus('none');
      }
    })
  }

  uploadKYCFile(event) {
    let file;
    let url = 'sellers/uploadAttachments?type=documents';
    var headers = new HttpHeaders();
    let formData: FormData = new FormData();
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    for (var i = 0; i < event.length; i++) {
      if (event[i]) {
        file = event[i];
      }
      formData.append('file', file);
    }
    this.http.post(this.appConfig.serverUrl + url, formData, { headers: headers }).subscribe(res => {
      if (res) {
        this.fileName = res;
        if(!this.accountDetails.KYCDocs){
          this.accountDetails.KYCDocs = [];
        }
        if (this.fileName && this.fileName.fileName && this.fileName.fileName.length) {
          for (let i = 0; i < this.fileName.fileName.length; i++) {
            this.accountDetails.KYCDocs.push(this.fileName.fileName[i].name);
          }
        }
      }
    });
  }


  //function to get all categories for auto suggestion
  getAllCategories(event: any) {
    if (event && event.query) {
      var URL = 'categories?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.categories = res.categories;
        } else {
          this.categories = [];
        }
      });
    }
  }


  // To get all the brands list for auto suggestion
  searchBrands(event) {
    if (event && event.query) {
      var URL = 'brands?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.brands = res.brands;
        } else {
          this.brands = [];
        }
      });
    }
  }

  setLocalStorage() {
    this.appService.manageHttp('get', 'sellers/' + this.loginVendorId, '').subscribe(res => {
      if (res && res.details) {
        localStorage.removeItem('vendor');
        localStorage.setItem('vendor', JSON.stringify({ vendor: res.details }));
        this.NavService.callComponentMethod();
      }
    })
  }


  getCountriesList(event) {
    if (event && event.query) {
      this.appService.manageHttp('get', 'countries', '').subscribe(res => {
        if (res && res.countrys && res.countrys.length && res.countrys.length > 0) {
          this.countries = res.countrys;
        } else {
          this.countries = [];
        }
      });
    }
  }

}
