import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordValidator, phoneValidator, matchingPasswords } from '../../validators';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
declare let $;

@Component({
  selector: 'az-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  serverUrl: any = 'settings';
  totalRecords: number;
  totalSettings: any = {};
  Id: any;
  settingsId: any;
  settingsForm: FormGroup;
  modelData: any = {};
  category: any = {};
  vendor: any = {};
  typeOptions: any = [
    { label: 'Category', value: 'Category' },
    { label: 'Vendor', value: 'Vendor' }
  ]
  allCategories: any = [];
  sellersList: any = [];
  submitted: boolean;
  disabled: boolean;
  iter: number = 0;
  totalCategories: any = [];
  totalVendorWisePercentage: any = [];
  totalCommisions: any = [];
  settingsType:string;

  constructor(public fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService,
    public activeRoute: ActivatedRoute) {
    this.settingsForm = fb.group({
      type: ['', Validators.required],
      name: [''],
      adminCharge: ['', Validators.required]
    });

  }

  //Get Settings
  getAllSettings(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['created', 'categories.name','adminCharge','type'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    if (!filterCriteria.criteria) {
      filterCriteria.criteria = [];
    }
    filterCriteria["criteria"].push({ "key": "role", "value": "Super Admin", "type": "in" });
    URL = this.serverUrl + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.settings && res.settings.length && res.settings.length > 0) {
        this.totalSettings = res.settings[0];
        this.settingsId = this.totalSettings._id;
        this.totalCommisions = res.superAdminCharges;
        this.totalCommisions.forEach((commison,index)=>{
           if(event && event.first){
             commison.srNo = (index + 1) + event.first;
           } else{
              commison.srNo = index +1;
           }
        });
        if (res && res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalCommisions = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }


  // To Add Settings
  AddSettings(type?: any, data?: any) {
    this.modelData = {};  
    this.submitted = false;
    if (type === 'add') {
      this.settingsType='';
      this.settingsForm.reset();
      $('#addedit').modal({ backdrop: 'static', keyboard: false }, 'show');
    } else if (data) {
      var rowData = JSON.parse(JSON.stringify(data));
      if (rowData.type == 'Vendor') {
        this.modelData.type = rowData.type;
        this.vendor = {
          name: { companyName: rowData.name, _id: rowData.vendorId }, adminCharge: rowData.adminCharge,
          _id: rowData.id,vendorId:rowData.vendorId
        };
      }
      if (rowData.type == 'Category') {
        this.modelData.type = rowData.type;
        this.category = { name: { tree: rowData.name,_id: rowData.categoryId }, adminCharge: rowData.adminCharge, 
        _id: rowData.id,categoryId:rowData.categoryId };
      }
      if (type == 'edit') {
        this.settingsType = 'EDIT';
        $('#addedit').modal({ backdrop: 'static', keyboard: false }, 'show');
      }
      if (type == 'delete') {
        this.settingsType = 'DELETE';
        $('#deleteSettings').modal({ backdrop: 'static', keyboard: false }, 'show');
      }
    }
  }

  //Update settings
  updatedSettings() {
    if (this.settingsForm.status === 'INVALID' || (!this.category.name && !this.vendor.name)) {
      this.submitted = true;
      return;
    } else if (this.settingsForm.status === 'VALID' && this.category.name && !this.category.name.tree && !this.vendor.name) {
      this.submitted = true;
      return;
    } else if (this.settingsForm.status === 'VALID' && this.vendor.name && !this.vendor.name.companyName && !this.category.name) {
      this.submitted = true;
      return;
    } else {
      if (this.category.name && this.category.name.tree) {
        this.category.categoryId=this.category.name._id;
        this.category.name = this.category.name.tree;
        if (this.category._id && this.settingsType === 'EDIT') {
          this.category.operation = 1;
        } else if (this.category._id && this.settingsType === 'DELETE'){
           this.category.operation = 2;
        }  else {
          this.category.operation = 0;
        }
        this.modelData.category = this.category;
      }
      if (this.vendor.name && this.vendor.name.companyName) {
        this.vendor.vendorId=this.vendor.name._id;
        this.vendor.name = this.vendor.name.companyName;
        if (this.vendor._id && this.settingsType === 'EDIT') {
          this.vendor.operation = 1;
        } else if (this.vendor._id && this.settingsType === 'DELETE') {
          this.vendor.operation = 2;
        } else {
          this.vendor.operation = 0;
        }
        this.modelData.vendorWisePercentage = this.vendor;
      }

      this.appService.loaderStatus('block');
      this.disabled = true;
      this.appService.manageHttp('put', 'settings' + '/' + this.settingsId, this.modelData).subscribe(res => {
        if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
          this.appService.displayToasterMessage(res.respMessage);
          $('#addedit').modal('hide');
          $('#deleteSettings').modal('hide');
          this.getAllSettings();
          this.appService.loaderStatus('none');
          this.disabled = false;
        } else {
          this.disabled = false;
          this.appService.displayToasterMessage(res.respMessage, 'error');
          this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
        this.appService.loaderStatus('none');
        this.disabled = false;
      });

    }
  }

  //for deleing settongs
  delete(data) {
    this.Id = data._id;
    $('#deleteSettings').modal({ backdrop: 'static', keyboard: false }, 'show');
  }

  //Delete Settings
  deleteSettings() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.appService.displayToasterMessage(res.respMessage);
        $('#deleteSettings').modal('hide');
        this.getAllSettings();
        this.appService.loaderStatus('none');
      }
      else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    })
  }

  // to get all Categories
  getAllCategories(event?: any) {
    if (event && event.query) {
      var URL = 'categories?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res && res.categories && res.categories.length && res.categories.length > 0) {
          this.allCategories = res.categories;
        } else {
          this.allCategories = [];
        }
      });
    }
  }

  // Get List for Sellers
  getTotalSellersList(event?: any) {
    if (event && event.query) {
      var URL = 'sellers?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "companyName", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res && res.sellers && res.sellers.length && res.sellers.length > 0) {
          this.sellersList = res.sellers;
        } else {
          this.sellersList = [];
        }
      });
    }
  }

}
