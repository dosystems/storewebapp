import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { emailValidator, phoneValidator, passwordValidator, matchingPasswords } from '../../validators';

@Component({
  selector: 'az-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  categories: any;
  brands: any;
  regForm: FormGroup;
  storeDetails: FormGroup;
  sellerDetails: FormGroup;
  bankDetails: FormGroup;
  submitted: boolean = false;
  captcha: boolean;
  showForm: any = 'company';
  countries: any = [];
  vendorFullDetails: any = {};
  fileName:any;
  address:any = {};
  kycValidation:boolean=false;
  constructor(public appService: AppService, public appConfig: AppConfig, public formBuilder: FormBuilder, public toastr: ToastrService, public router: Router,public http: HttpClient) {
    this.storeDetails = this.formBuilder.group({
      shopTitle: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      website: [''],
      password: ['', Validators.compose([Validators.required, passwordValidator])],
      confirmPassword: ['', Validators.required]
    }, { validator: matchingPasswords('password', 'confirmPassword') });

    this.sellerDetails = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      country: ['',Validators.required],
      street: ['', Validators.required],
      city:['',Validators.required],
      state:['',Validators.required],
      zip:['',Validators.required]

    })

    this.bankDetails = this.formBuilder.group({
      beneficiaryName: ['', Validators.required],
      bankName: ['', Validators.required],
      branch: ['', Validators.required],
      accountNumber: ['', Validators.required],
      IBAN: ['', Validators.required],
      swiftCode: ['', Validators.required]

    })

    this.getCountriesList();
  }

  ngOnInit() {
    //to stop main loader

    document.getElementById('preloader').style['display'] = 'none';

  }

  // To get all the categories list for auto suggestion
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

  //To create vendor account
  createVendor() {
    if (this.regForm && this.regForm.status && this.regForm.status == 'VALID') {
      // if(!this.captcha){
      //   this.toastr.error('Please select captcha');
      //   return;
      // }
      //this.appService.loaderStatus('block');
      if (this.regForm.value.brand && this.regForm.value.brand.name) {
        this.regForm.value.brand = this.regForm.value.brand.name;
      }
      if (this.regForm.value.productCategory && this.regForm.value.productCategory.tree) {
        this.regForm.value.productCategory = this.regForm.value.productCategory.tree;
      }


      delete this.regForm.value.confirmPassword;
      this.appService.manageHttp('post', 'sellers/signUp', this.regForm.value).subscribe(res => {
        if (res && res.respMessage) {
          // this.appService.loaderStatus('none');
          this.toastr.success(res.respMessage);
          setTimeout(() => { this.router.navigate(['/login']) }, 1500);
        } else if (res && res.errorMessage) {
          this.toastr.error(res.errorMessage);
          //this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.toastr.error('something went wrong');
        //this.appService.loaderStatus('none');
      });
    } else {
      this.submitted = true;
    }
  }

  // to validate captcha
  showResponse(event?: any) {
    this.captcha = true;
  }

  onClickNext(form, next) {
    if (form && form.status && form.status == "VALID") {
      this.submitted = false;
      this.showForm = next;
    } else if (form == 'file') {
      if(!this.vendorFullDetails.KYCDocs){
        this.kycValidation = true;
        return;
      }else if(this.vendorFullDetails.KYCDocs.length&&this.vendorFullDetails.KYCDocs.length>0){
        this.kycValidation = false;
        this.submitted = false;
        this.showForm = next;
      }
    } else {
      this.submitted = true;
    }

  }
  onClickBack(previous) {
    this.showForm = previous;
  }

  getCountriesList() {
    this.appService.manageHttp('get', 'countries', '').subscribe(res => {
      if (res && res.countrys && res.countrys.length && res.countrys.length > 0) {
        let allcountries = res.countrys;
        for (let i = 0; i < allcountries.length; i++) {
          this.countries.push({ label: allcountries[i].name, value: allcountries[i] })
        }
      }
    })
  }

  createSeller(form) {
    if (form && form.status && form.status == "VALID") {
      //Collecting store details
      if (this.storeDetails && this.storeDetails.value) {
        for (var details in this.storeDetails.value) {
          this.vendorFullDetails[details] = this.storeDetails.value[details];
          if(details == 'shopTitle'){
            this.vendorFullDetails[details] = this.appService.capitalize(this.vendorFullDetails[details])
          }
        }
      }
      //Collecting Seller details
      if (this.sellerDetails && this.sellerDetails.value) {
        this.vendorFullDetails['address'] = {};
        for (var details in this.sellerDetails.value) {
          if(details != 'phoneNumber' && details != 'country' && details != 'zip'){
            if(this.vendorFullDetails[details])
            this.vendorFullDetails[details] = this.appService.capitalize(this.vendorFullDetails[details])
          }
          if(details == 'street' || details == 'zip' || details == 'state' || details == 'city'){
            this.vendorFullDetails['address'][details] = this.sellerDetails.value[details];
          } else if(details == 'country'){
            this.vendorFullDetails['address']['country'] = this.sellerDetails.value[details].name; 
            if(this.sellerDetails.value[details].countryCode){
              this.vendorFullDetails['address']['countryCode'] = this.sellerDetails.value[details].countryCode;           
            }            
          } else{
            this.vendorFullDetails[details] = this.sellerDetails.value[details];
          }          
        }
      }
      //Collecting Bank details
      if (this.bankDetails && this.bankDetails.value) {
        this.vendorFullDetails['bankDetails'] = {};
        for (var details in this.bankDetails.value) {
          this.vendorFullDetails['bankDetails'][details] = this.bankDetails.value[details];
        }
      }    


      this.appService.manageHttp('post','sellers/signUp',this.vendorFullDetails).subscribe(res =>{
        if(res && res.respMessage){
          this.toastr.success(res.respMessage);
          setTimeout(() => { this.router.navigate(['/login']) }, 1500);
        }else if(res && res.errorMessage){
          this.toastr.error(res.errorMessage);
        }
      })      

    } else {
      this.submitted = true;
    }
  }

  uploadFile(event) {   
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
    this.http.post(this.appConfig.serverUrl + url,formData,{ headers: headers }).subscribe(res => {      
      if(res){
        this.fileName = res;        
        this.vendorFullDetails.KYCDocs = [];
        if(this.fileName && this.fileName.fileName && this.fileName.fileName.length){
          for(let i=0;i < this.fileName.fileName.length;i++){
            this.vendorFullDetails.KYCDocs.push(this.fileName.fileName[i].name);
          }
        }  
        if(this.vendorFullDetails.KYCDocs&&this.vendorFullDetails.KYCDocs.length){
          this.kycValidation=false;
        }                   
      }    
    })   
  }
}
