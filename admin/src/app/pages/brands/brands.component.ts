import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  sizeChartPath = this.appConfig.imageUrl + 'sizeChart/';
  brandsForm: FormGroup;
  serverUrl: any = 'brands';
  brandData: any = {}; //for binding data with ngModel
  totalCategories: any = []; //for autocomplete
  brandsList: any = [];
  submitted: any = false;
  totalRecords: number;
  brandId: any;
  ExportCsv: any = [];
  employeeData:any = {};
  constructor(public fb: FormBuilder, public router: Router, public appService: AppService, public appConfig: AppConfig,
    public toastr: ToastrService) {

    this.brandsForm = fb.group({
      name: ['', Validators.required],
      longName: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.ExportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Name ', field: 'name' },
      { header: 'LongName', field: 'longName' },
      { header: 'Category', field: 'sizeChart' },
      { header: 'Created', field: 'created' },
      { header: 'CreatedBy', field: 'createdBy.name' }
    ]
  }


  //Uploading Sze Chart
  uploadChart(input) {
    this.appService.loaderStatus('block');
    let image = input[0];
    var photoPath = this.appService.fileUpload(image, 'file', 'brands/uploadSizeChartImage');
    photoPath.subscribe((res) => {
      if (res) {
        var response = res;
      }
      if (response && response.respCode && response.respCode === this.appService.respCode204) {
        this.toastr.success(response.respMessage);
        this.appService.loaderStatus('none');
        let files = response.fileName[0].name;
        this.brandData.sizeChart = files;

      } else {
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  }

  //Actions For modals
  onClickActions(type?: any, data?: any) {
    this.brandData = {};
    this.submitted = false;
    if (type === 'add') {
      this.brandData.sizeChart = '';
      this.brandsForm.reset();
      $('#AddorEdit').modal('show');
    } else if (data) {
      this.brandData = JSON.parse(JSON.stringify(data));
      this.brandId = this.brandData._id;
      if (type === 'edit') {
        this.brandsForm.controls.category.setValue({ 'name': this.brandData.category });
        $('#AddorEdit').modal('show');
      } else if (type === 'delete') {
        $('#deleteBrand').modal('show');
      } else if (type === 'details') {
        $('#openBrandDetailsModal').modal('show');
      }
    }
  }

  ///For Adding and Updating
  AddOrUpdate() {
    if (this.brandsForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    if (this.brandData.category) {
      this.brandData.category = this.brandData.category.name;
    }
    let method;
    let Url;
    if (this.brandData._id) {
      method = 'put';
      Url = this.serverUrl + '/' + this.brandData._id;
    } else {
      method = 'post';
      Url = this.serverUrl;
    }
    this.brandData.name = this.appService.capitalize(this.brandData.name);
    this.brandData.longName = this.appService.capitalize(this.brandData.longName);
    if (this.brandData.category) {
      this.appService.loaderStatus('block');
      this.appService.manageHttp(method, Url, this.brandData).subscribe(res => {
        if (res && res.respMessage) {
          $('#AddorEdit').modal('hide');
          this.getAllBrands();
          this.appService.loaderStatus('none');
          this.appService.displayToasterMessage(res.respMessage);
        }
        else {
          this.appService.loaderStatus('none');
          this.appService.displayToasterMessage(res.errorMessage);
        }
      }, (error) => {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      });
    }
  }




  //For Deleting The Brand
  deleteBrand() {
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.brandId, '').subscribe(res => {
      if (res && res.respMessage) {
        $('#deleteBrand').modal('hide');
        this.getAllBrands();
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.respMessage);
      }
      else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    })
  }


  //Get Call For Getting  All  Brands
  getAllBrands(event?: any) {
    let filterCriteria;
    let filterLabels = ['name', 'longName', 'category', 'sizeChart', 'created', 'createdBy.name'];
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
      if (res && res.brands) {
        this.brandsList = res.brands;
        for (let i = 0; i < this.brandsList.length; i++) {
          if (event && event.first) {
            this.brandsList[i].srNo = (i + 1) + event.first;
          }
          else {
            this.brandsList[i].srNo = i + 1;
          }
          if (this.brandsList[i].created) {
            this.brandsList[i].created = moment(this.brandsList[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.brandsList = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    })

  }

  //For autocomplete Field 
  getAllCategories(event?: any) {
    if (event && event.query) {
      let filter = { "sortfield": "created", "direction": "desc", "criteria": [{ "key": "name", "value": event.query, "type": "regexOr" }] }
      var URL = 'categories' + '?filter=' + JSON.stringify(filter);
      this.appService.manageHttp('get', URL, '').subscribe(res => {
        if (res && res.categories) {
          this.totalCategories = res.categories;
        } else {
          this.totalCategories = [];
          this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      })
    }
  }
  //For autocomplete Field 
  
  // For Details for CreatedBy
  viewDetails(data) {
    var Brand = JSON.parse(JSON.stringify(data));
    if (Brand.createdBy.employee) {
      let id = Brand.createdBy.employee._id;
      this.getEmployeeDetails(id);
    } else if (Brand.createdBy.buyer) {
      this.router.navigate(['/details/Customer'], { queryParams: { id: Brand.createdBy.buyer._id } });
    } else {
      this.router.navigate(['/details/Merchant'], { queryParams: { id: Brand.createdBy.seller._id } });
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
