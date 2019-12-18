import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
declare var $: any;

@Component({
  selector: 'az-add-settings',
  templateUrl: './add-settings.component.html',
  styleUrls: ['./add-settings.component.scss']
})
export class AddSettingsComponent implements OnInit {
  allCategories: any = [];
  commonSettingsForm: FormGroup;
  categories: any = [{ name: '', adminCharge: '' }];
  vendorPercentage: any = [{ name: '', adminCharge: '' }];
  settingsData: any = {}; // For Creating & Updating
  sellersList: any = [];
  countries: any = [];
  Languages: any = [
    { label: 'English', value: 'ENG' },
    { label: 'German', value: 'GER' },
    { label: 'Chinese', value: 'CH' },
    { label: 'Japanese', value: 'JAP' },
    { label: 'Hindi', value: 'HIN' },
    { label: 'Arab', value: 'ARAB' },
    { label: 'Spanish', value: 'ESP' },
    { label: 'French', value: 'FRE' },
    { label: 'Dutch', value: 'NL' },
    { label: 'Russian', value: 'RUS' }
  ];
  submitted: boolean;
  disabled: boolean = false;
  supportedCountries: any = [];
  supportedLanguages: any = [];
  settingId: any;
  setting: any = {}  //For Get By Id
  isCategoryValidation: boolean;
  isVendorValidation: boolean;
  settingsId: any;

  constructor(public appService: AppService, fb: FormBuilder, public appConfig: AppConfig, public router: Router, public activeRoute: ActivatedRoute) {
    this.commonSettingsForm = fb.group({
      categoryLevelsLimit: ['', Validators.required],
      expireTime: ['', Validators.required],
      estimatedDeliveryDays: ['', Validators.required],
      defaultPercentage: ['', Validators.required]

    });
    this.getAllSettings();
    this.getCountriesList();
    // activeRoute.params.subscribe(p => { this.settingId = p['settingsId'] });
    // if (this.settingId) {
    //   this.getSettingsById(this.settingsId);
    // }
  }

  ngOnInit() {
    let that = this;
    $(function () {
      $('.summernote').summernote({
        height: 200,
        placeholder: 'Enter Privacy Policy',
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

  //get COuntries list for multiselect
  getCountriesList() {
    this.appService.manageHttp('get', 'countries', '').subscribe(res => {
      if (res && res.countrys && res.countrys.length && res.countrys.length > 0) {
        let allcountries = res.countrys;
        for (let i = 0; i < allcountries.length; i++) {
          this.countries.push({ label: allcountries[i].name, value: allcountries[i].countryCode })
        }
      }
    });
  }

  //Get Settings
  getAllSettings(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = [];
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
    filterCriteria.criteria.push({ "key": "role", "value": "Super Admin", "type": "in" });
    URL = 'settings/' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.settings && res.settings.length && res.settings.length > 0) {
        // this.totalSettings = res.settings;
        this.settingsId = res.settings[0]._id;
        this.getSettingsById(this.settingsId);

        this.appService.loaderStatus('none');
      } else {
        // this.totalSettings = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }


  //Get By Id
  getSettingsById(id) {
    this.appService.manageHttp('get', 'settings' + '/' + id, '').subscribe(res => {
      if (res && res.details) {
        this.setting = res.details;
        if (this.setting.supportedCountries) {
          this.supportedCountries = this.setting.supportedCountries;
        }
        if (this.setting.supportedLanguages) {
          this.supportedLanguages = this.setting.supportedLanguages;
        }

        if (this.setting.categories) {
          this.categories = [];
          this.categories = this.setting.categories.map(obj => {
            return { name: { tree: obj.name, _id: obj.categoryId }, adminCharge: obj.adminCharge };
          });
        }

        if (this.setting.vendorWisePercentages) {
          this.vendorPercentage = [];
          this.vendorPercentage = this.setting.vendorWisePercentages.map(obj => {
            return { name: { companyName: obj.name, _id: obj.vendorId }, adminCharge: obj.adminCharge };
          });
        }
        if (this.setting.privacyPolicy) {
          $('#description .note-editable')[0].innerHTML = this.setting.privacyPolicy;
        }

      } else {
        this.setting = {};
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage("Server Error Exist", 'error');
    });
  }

  //For Creating Settings
  saveSettings(commonSettingsForm) {
    //For Categories comminsion
    if (this.categories && this.categories.length > 0) {
      for (var i = 0; i < this.categories.length; i++) {
        if (!this.categories[i].name || !this.categories[i].adminCharge) {
          this.isCategoryValidation = true;
        } else {
          this.isCategoryValidation = false;
        }
        if (this.categories[i].name && this.categories[i].name.tree) {
          if (this.categories[i].name._id) {
            this.categories[i].categoryId = this.categories[i].name._id;
          }
          this.categories[i].name = this.categories[i].name.tree;
        }
      }
    } else {
      this.categories = [];
    }
    //For Vendor wise Commison
    if (this.vendorPercentage && this.vendorPercentage.length > 0) {
      for (var i = 0; i < this.vendorPercentage.length; i++) {
        if (!this.vendorPercentage[i].name || !this.vendorPercentage[i].name.companyName) {
          this.isVendorValidation = true;
        } else {
          this.isVendorValidation = false;
        }
        if (this.vendorPercentage[i].name && this.vendorPercentage[i].name.companyName) {
          if (this.vendorPercentage[i].name._id) {
            this.vendorPercentage[i].vendorId = this.vendorPercentage[i].name._id;
          }
          this.vendorPercentage[i].name = this.vendorPercentage[i].name.companyName;
        }
      }
    } else {
      this.vendorPercentage = [];
    }
    if (commonSettingsForm.value && commonSettingsForm.value.categoryLevelsLimit) {
      this.settingsData.categoryLevelsLimit = commonSettingsForm.value.categoryLevelsLimit;
    }
    if (commonSettingsForm.value && commonSettingsForm.value.expireTime) {
      this.settingsData.expireTime = commonSettingsForm.value.expireTime;
    }
    if (commonSettingsForm.value && commonSettingsForm.value.estimatedDeliveryDays) {
      this.settingsData.estimatedDeliveryDays = commonSettingsForm.value.estimatedDeliveryDays;
    }
    if (commonSettingsForm.value && commonSettingsForm.value.defaultPercentage) {
      this.settingsData.defaultPercentage = commonSettingsForm.value.defaultPercentage;
    }
    if (this.supportedCountries) {
      this.settingsData.supportedCountries = this.supportedCountries;
    }
    if (this.supportedLanguages) {
      this.settingsData.supportedLanguages = this.supportedLanguages;
    }
    this.settingsData.categories = this.categories;
    this.settingsData.vendorWisePercentages = this.vendorPercentage;
    this.settingsData.privacyPolicy = this.appService.formatEditorData($('#description .note-editable')[0].innerHTML);
  }




  //For Creating OR updating settings
  save(commonSettingsForm) {
    this.saveSettings(commonSettingsForm);
    if (commonSettingsForm.invalid
      || (this.settingsData.supportedCountries.length == 0 || this.settingsData.supportedCountries.length < 1)
      || (this.settingsData.supportedLanguages.length == 0 || this.settingsData.supportedLanguages.length < 1)) {
      this.submitted = true;
      return
    } else {
      let method, Url;
      if (this.settingsId) {
        method = 'put'
        Url = 'settings' + '/' + this.settingsId;
      } else {
        method = 'post'
        Url = 'settings';
      }
      this.disabled = true;
      this.appService.manageHttp(method, Url, this.settingsData).subscribe(res => {
        if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
          this.appService.displayToasterMessage(res.respMessage);
          this.router.navigate(['/addsettings']);
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
      })
    }
  }
  //Add level if needed
  addLevel() {
    this.categories.push({ name: '', adminCharge: '' });
  }
  //Add Vendor level if needed
  addVendorLevel() {
    this.vendorPercentage.push({ vendorId: '', adminCharge: '' });
  }
  // on click remove category
  removeCategory(i) {
    if (this.categories && this.categories.length && this.categories.length === 1) {
      return;
    } else {
      this.categories.splice(i, 1);
    }
  }
  // Remove vendorWisePercentages
  removeVendor(i) {
    if (this.vendorPercentage && this.vendorPercentage.length && this.vendorPercentage.length === 1) {
      return;
    } else {
      this.vendorPercentage.splice(i, 1);
    }
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

  //Function to do bulk upload
  bulkUpload(input) {
    let res;
    this.appService.bulkUpload('entity', input).subscribe(response => {
      res = response;
      if (res.sucess && res.sucess.respMessage) {
        $('#productsBulkUpload').modal('hide');
        this.appService.displayToasterMessage(res.sucess.respMessage);
      } else if (res.failure && res.failure.errorMessage) {
        this.appService.displayToasterMessage(res.failure.errorMessage, 'error');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });
  }



  // to download images for uploaded products
  saveImagesForUploadedProducts() {
    this.appService.manageHttp('get', 'entities/downloadCrafsProducts', '').subscribe((res) => {
      if (res && res.respCode == 200) {
        this.appService.displayToasterMessage(res.respMessage);
      } else {
        this.appService.displayToasterMessage(res.errMessage, 'error');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      this.appService.loaderStatus('none');
    });
  }
}
