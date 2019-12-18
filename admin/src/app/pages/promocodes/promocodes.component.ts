import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from "../../app.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from "../../app.config";
import * as moment from 'moment/moment';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
declare var $: any;

@Component({
  selector: 'az-promocodes',
  templateUrl: './promocodes.component.html',
  styleUrls: ['./promocodes.component.scss']
})
export class PromocodesComponent implements OnInit {
  form: FormGroup;
  promocodes: any = [];
  loggedInUserId: any;
  addPromocode: any = {};
  showUpdateButton: any = false;
  showCreateButton: any = true;;
  promocodeDetails: any;
  submitted: any = false;
  formType: any;
  totalRecords: any;
  selectedpromocodeId: any = '';
  loggedInUserRole: any;;
  globalSearchFields: any = {};
  planNameArray: any = [];
  myDatePickerOptions: IMyDpOptions = {
    todayBtnTxt: 'Today',
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '30px',
    inline: false,
    selectionTxtFontSize: '14px',
    editableDateField: false,
    openSelectorOnInputClick: true
  };
  selDate: any;
  todaysDate3: any;
  promoCodeTypes: any = [];
  promoStatus: any = [];
  needtoupdatepromocodestatusto: any;
  toNewOrOldUsersArray: any = [
    { label: 'New', value: 'New' },
    { label: 'Old', value: 'Old' }
  ];
  loginEmpDetails: any = {};
  exportCsv: any = [];
  promoTypes: any = ['Discount', 'FreeShipping', 'Cashback'];
  promeName: string;
  constructor(private fbld: FormBuilder, public route: Router, public appService: AppService,
    public appConfig: AppConfig) {

    let d: Date = new Date();
    this.selDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    this.formType = 'Add';
    this.form = this.fbld.group({
      promoCode: ['', Validators.required],
      promoType: ['', Validators.required],
      maxUsersLimitToUse: ['', Validators.required],
      //noOfDays: [''],
      toNewOrOldUsers: ['', Validators.required],
      promoCodeEndDate: ['', Validators.required],
      promoCodeStartDate: ['', Validators.required],
      // requiredCreditCardOrNotForFreeCoupon: [''],
      // planName: [''],
      maxDiscountAmount: [''],
      minPurchaseValue: [''],
      discountPercentage: ['']
    });
    let todaysDate = new Date();
    let todaysDate2 = todaysDate.setDate(todaysDate.getDate() - 1);
    this.todaysDate3 = moment(todaysDate).format('MM/DD/YYYY');
    if (this.todaysDate3) {
      this.myDatePickerOptions.disableUntil = { year: this.todaysDate3.split('/')[2], month: this.todaysDate3.split('/')[0], day: this.todaysDate3.split('/')[1] };
    }
    this.getLocalStorageData();
    // this.getSearchPlansNames();

  }

  ngOnInit() {
    this.exportCsv = [
      { label: 'S.No', field: 'serialNo' },
      { label: 'Promo Code', field: 'promoCode' },
      { label: 'Promo Type', field: 'promoType' },
      { label: 'Used Count', field: 'maxNoOfUsersUsedTillNow' },
      { label: 'Start Date', field: 'promoCodeStartDate' },
      { label: 'Expiration Date', field: 'promoCodeEndDate' },
      { label: 'Created', field: 'created' },
      { label: 'Status', field: 'status' }
    ];

    this.promoCodeTypes = [
      { label: 'All', value: null },
      { label: 'Discount', value: 'Discount' },
      { label: 'FreeShipping', value: 'FreeShipping' },
      { label: 'Cashback', value: 'Cashback' }
    ];
    this.promoStatus = [
      { label: 'All', value: null },
      { label: 'Active', value: 'Active' },
      { label: 'Disabled', value: 'Disabled' }
    ];
  }
  //for promoname
  onChangepromtype(promotype?: any) {
    if (promotype === 'Discount') {
      this.promeName = 'Discount';
    } else if (promotype === 'Cashback') {
      this.promeName = 'Cashback';
    } else {
      this.promeName = '';
    }
  }

  //On Change Date
  onDateChanged(event: IMyDateModel) {
    if (event && event.jsdate) {
      let date2 = moment(event.jsdate).format('MM/DD/YYYY');
      if (date2) {
        var trailDate = { date: date2, formatted: date2 };
      }
    }
  }

  // click add new promocode button
  addNewPromocode() {
    //  this.promoCodeTypes.shift();
    this.addPromocode = {};
    // this.addPromocode.requiredCreditCardOrNotForFreeCoupon = null;
    this.formType = 'Add';
    this.submitted = false;
    this.showUpdateButton = false;
    this.showCreateButton = true;
    this.form.reset();
  }


  //Crud Actions
  selectMoreOptions(type?: any, promocode?: any) {
    if (type && promocode && promocode._id) {
      this.submitted = false;
      if (type === 'Edit') {
        this.formType = 'Edit';
        //   this.promoCodeTypes.shift();
        this.showUpdateButton = true;
        this.showCreateButton = false;
        this.getPromocodeByPromocodeId(promocode._id);
      } else if (type === 'Disable') {
        this.needtoupdatepromocodestatusto = "Enabled";
        this.selectedpromocodeId = '';
        this.selectedpromocodeId = promocode._id;
        setTimeout(() => {
          $('#promocodeStatusUpdateConfirmationPopUp').modal({ backdrop: 'static', keyboard: false }, 'show');
        }, 200);
      } else if ( type === 'Enable' ) {
        this.needtoupdatepromocodestatusto = "Disabled";
        this.selectedpromocodeId = '';
        this.selectedpromocodeId = promocode._id;
        setTimeout(() => {
          $('#promocodeStatusUpdateConfirmationPopUp').modal({ backdrop: 'static', keyboard: false }, 'show');
        }, 200);
      } else if (type === 'Delete') {
        this.selectedpromocodeId = '';
        this.selectedpromocodeId = promocode._id;
        this.showPromocodeDeleteConfirmationModal();
      }
    }
  }


  // Update status
  updatePromocodeStatus(status: any) {
    if (status === 'Enabled') {
      status = 'Disabled'
    }else if (status === 'Disabled') {
      status = 'Enabled'
    }
    if (this.selectedpromocodeId && status) {
      let body = {
        status: status
      };
      this.appService.manageHttp('put', 'promocodes/' + this.selectedpromocodeId, body).subscribe((res) => {
        if (res && res.respCode) {
          this.appService.displayToasterMessage(res.respMessage);
          $('#promocodeStatusUpdateConfirmationPopUp').modal('hide');
          this.getAllPromocodes(event);
        } else {
          this.appService.displayToasterMessage(res.errorMessage, 'error');
        }
      });
    }
  }

  // show promocode delete confirmation popup
  showPromocodeDeleteConfirmationModal() {
    setTimeout(() => {
      $('#promocodeDeleteConfirmationPopUp').modal({ backdrop: 'static', keyboard: false }, 'show');
    }, 200);
  }

  // Delete promocode
  deletePromocode() {
    if (this.selectedpromocodeId) {
      let url = 'promocodes/' + this.selectedpromocodeId;
      this.appService.loaderStatus('block');
      this.appService.manageHttp('delete', url, this).subscribe((res) => {
        this.appService.loaderStatus('none');
        if (res && res.respCode) {
          this.appService.displayToasterMessage(res.respMessage);
          $('#promocodeDeleteConfirmationPopUp').modal('hide');
          this.getAllPromocodes(event);
        } else {
          this.appService.displayToasterMessage(res.errorMessage, 'error');
        }
      });
    }
  }

  //For Getting all promococdes
  getAllPromocodes(event?: any) {
    let filterCriteria;
    let filterLabels = [];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }

    if (!filterCriteria) {
      return;
    }
    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }
    this.appService.loaderStatus('block');
    let Url = 'promocodes?filter=' + JSON.stringify(filterCriteria) + '';
    this.appService.manageHttp('get', Url, '').subscribe((res) => {
      this.appService.loaderStatus('none');
      if (res && res.promocodes && res.promocodes.length && res.promocodes.length > 0) {
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.promocodes = res.promocodes;
        if (this.promocodes && this.promocodes.length > 0) {
          for (var i = 0; i < this.promocodes.length; i++) {

            // if (!this.promocodes[i].maxNoOfUsersUsedTillNow) {
            //   this.promocodes[i].userOptions.push('Delete');
            // }
            if (event && event.first) {
              this.promocodes[i].serialNo = (i + 1) + event.first;
            } else {
              this.promocodes[i].serialNo = (i + 1);
            }
          }
        }
      } else {
        this.promocodes = [];
      }
    });
  }

  // Insert Promocode
  createPromocode(form: any) {

    if (form.value && (form.value.promoType === 'Discount' || form.value.promoType === 'Cashback')) {
      // this.form.controls['planName'].setValidators(Validators.required);
      this.form.controls['maxDiscountAmount'].setValidators(Validators.required);
      this.form.controls['minPurchaseValue'].setValidators(Validators.required);
      this.form.controls['discountPercentage'].setValidators(Validators.required);
    } else {
      this.form.controls['maxDiscountAmount'].setValidators(null);
      this.form.controls['minPurchaseValue'].setValidators(null);
      this.form.controls['discountPercentage'].setValidators(null);
    }

    this.form.controls['maxDiscountAmount'].updateValueAndValidity();
    this.form.controls['minPurchaseValue'].updateValueAndValidity();
    this.form.controls['discountPercentage'].updateValueAndValidity();

    if (form.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    if (form.value) {
      if (form.value.promoCodeEndDate && form.value.promoCodeEndDate.formatted) {
        form.value.promoCodeEndDate = form.value.promoCodeEndDate.formatted;
      }
      if (form.value.promoCodeStartDate && form.value.promoCodeStartDate.formatted) {
        form.value.promoCodeStartDate = form.value.promoCodeStartDate.formatted;
      }
      if (form.value.promoType === 'FreeShipping') {
        delete form.value.maxDiscountAmount;
        delete form.value.minPurchaseValue;
        delete form.value.discountPercentage;
      } else {

        if (form.value.discountPercentage) {
          form.value.discountPercentage = parseFloat(form.value.discountPercentage);
        }
      }
      var createPromocodeUrl = 'promocodes?response=true';
      this.appService.loaderStatus('block');
      this.appService.manageHttp('post', createPromocodeUrl, form.value).subscribe((res) => {
        this.appService.loaderStatus('none');
        if (res && res.respCode && res.respCode === 204) {
          $('#addPromocodeModal').modal('hide');
          this.submitted = false;
          this.showUpdateButton = true;
          this.showCreateButton = false;
          this.appService.displayToasterMessage(res.respMessage);
          this.getAllPromocodes(event);
        } else {
          this.appService.displayToasterMessage(res.errorMessage, 'error');
        }
      });
    }
  }

  // Update Promocode
  updatePromocode(form: any) {

    if (form.value && form.value.promoType === 'null') {
      this.form.controls['promoType'].setValue(null);
    }
    if (form.value && form.value.toNewOrOldUsers === 'null') {
      this.form.controls['toNewOrOldUsers'].setValue(null);
    }

    if (form.value && (form.value.promoType === 'Discount' || form.value.promoType === 'Cashback')) {

      this.form.controls['maxDiscountAmount'].setValidators(Validators.required);
      this.form.controls['minPurchaseValue'].setValidators(Validators.required);
      this.form.controls['discountPercentage'].setValidators(Validators.required);
    } else {
      this.form.controls['maxDiscountAmount'].setValidators(null);
      this.form.controls['minPurchaseValue'].setValidators(null);
      this.form.controls['discountPercentage'].setValidators(null);
    }
    this.form.controls['maxDiscountAmount'].updateValueAndValidity();
    this.form.controls['minPurchaseValue'].updateValueAndValidity();
    this.form.controls['discountPercentage'].updateValueAndValidity();
    if (form.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    if (form.value && this.addPromocode._id) {
      if (form.value.promoCodeEndDate && form.value.promoCodeEndDate.formatted) {
        form.value.promoCodeEndDate = form.value.promoCodeEndDate.formatted;
      }
      if (form.value.promoCodeStartDate && form.value.promoCodeStartDate.formatted) {
        form.value.promoCodeStartDate = form.value.promoCodeStartDate.formatted;
      }
      if (form.value.promoType === 'FreeShipping') {
        delete form.value.maxDiscountAmount;
        delete form.value.minPurchaseValue;
        delete form.value.discountPercentage;
      } else {
        if (form.value.discountPercentage) {
          form.value.discountPercentage = parseFloat(form.value.discountPercentage);
        }
      }
      var updatePromocodeUrl = 'promocodes/' + this.addPromocode._id + '?response=true';
      this.appService.loaderStatus('block');
      this.appService.manageHttp('put', updatePromocodeUrl, form.value).subscribe((res) => {
        this.appService.loaderStatus('none');
        if (res && res.respCode) {
          $('#addPromocodeModal').modal('hide');
          this.submitted = false;
          this.showUpdateButton = false;
          this.showCreateButton = true;
          this.appService.displayToasterMessage(res.respMessage);
          form.reset();
          this.getAllPromocodes(event);
        } else {
          this.appService.displayToasterMessage(res.errorMessage, 'error');
        }
      });
    }
  }


  // Display Promocode Details
  getPromocodeDetails(promocode) {
    this.promocodeDetails = promocode;
    setTimeout(() => {
      $('#promocodeDetailsModal').modal({ backdrop: 'static', keyboard: false }, 'show');
    }, 200);
  }

  // get Promocode by promocode id
  getPromocodeByPromocodeId(id: any) {
    this.addPromocode = {};
    if (id) {
      this.appService.manageHttp('get', 'promocodes/' + id, '').subscribe((res) => {
        if (res && res.details) {
          this.addPromocode = res.details;
          if (this.addPromocode.discountPercentage === 0) {
            this.addPromocode.discountPercentage = '';
          }
          var promoCodeEndDate
          if (this.addPromocode.promoCodeEndDate) {
            promoCodeEndDate = moment(this.addPromocode.promoCodeEndDate).format('MM/DD/YYYY');
          } else {
            var todayDate = new Date();
            promoCodeEndDate = moment(todayDate).format('MM/DD/YYYY');
          }
          if (promoCodeEndDate) {
            this.addPromocode.promoCodeEndDate = { date: promoCodeEndDate, formatted: promoCodeEndDate };
          }
          var promoCodeStartDate
          if (this.addPromocode.promoCodeStartDate) {
            promoCodeStartDate = moment(this.addPromocode.promoCodeStartDate).format('MM/DD/YYYY');
          } else {
            var todayDate = new Date();
            promoCodeStartDate = moment(todayDate).format('MM/DD/YYYY');
          }
          if (promoCodeStartDate) {
            this.addPromocode.promoCodeStartDate = { date: promoCodeStartDate, formatted: promoCodeStartDate };
          }



          $('#addPromocodeModal').modal({ backdrop: 'static', keyboard: false }, 'show');
        }
      });
    }
  }


  //Get Search Plan Names
  // getSearchPlansNames() {
  //   this.appService.manageHttp('get', 'plans', '').subscribe(res => {
  //     if (res && res.plans && res.plans.length > 0) {
  //       //  this.planNameArray = res.plans;
  //       for (var i = 0; i < res.plans.length; i++) {
  //         if (res.plans[i] && res.plans[i].name) {
  //           this.planNameArray.push(
  //             { label: res.plans[i].name, value: res.plans[i].name }
  //           );
  //         }
  //       }

  //     } else {
  //       this.planNameArray = [];
  //       this.appService.displayToasterMessage(res.errorMessage);
  //     }
  //   }, (error) => {
  //     this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
  //   });
  // }

  // To get logged in employee data from localstorage
  getLocalStorageData() {
    if (localStorage.getItem('employee')) {
      let employee = JSON.parse(localStorage.getItem('employee'));
      if (employee && employee.employee && employee.employee._id) {
        this.loginEmpDetails = employee;
        this.loggedInUserRole = this.loginEmpDetails.role;
      }
    }
  }

  //For all Promo users
  getAllPromoCodesUsedByUsers(promo) {
    if (promo && promo.promoCode) {
      this.route.navigate(['userpromocodes/' + promo.promoCode]);
    }
  }


}
