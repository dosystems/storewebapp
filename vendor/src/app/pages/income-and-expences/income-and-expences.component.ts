import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare var $: any;

@Component({
  selector: 'az-income-and-expences',
  templateUrl: './income-and-expences.component.html',
  styleUrls: ['./income-and-expences.component.scss']
})
export class IncomeAndExpencesComponent {
  allStatements: any;
  totalRecords: any;
  incomeExpenceForm: FormGroup;
  incomeExpenceData: any = {};
  submitted: boolean;

  constructor(public appService: AppService, public appConfig: AppConfig, public tostr: ToastrService,
    public formBuilder: FormBuilder) {
    this.incomeExpenceForm = formBuilder.group({
      amount: ['', Validators.required],
      type: ['', Validators.required],
      remarks: ['', Validators.required]

    });   
  }


  //function to get all income and expenses statement

  getIncomeAndExpencesStatements(event?: any) {
    this.appService.loaderStatus('block');
    let filterCriteria;
    let filterLabels = ['amount','userName', 'remarks', 'type', 'created'];

    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    let url = 'statements?filter=' + JSON.stringify(filterCriteria);
    this.appService.manageHttp('get', url, '').subscribe(res => {
      if (res && res.statements && res.statements.length && res.statements.length > 0) {
        this.allStatements = res.statements;
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        for (let i = 0; i < this.allStatements.length; i++) {
          if (event && event.first) {
            this.allStatements[i].srNo = (i + 1) + event.first;
          }
          else {
            this.allStatements[i].srNo = i + 1;
          }
          if (this.allStatements[i].created) {
            this.allStatements[i].created = moment(this.allStatements[i].created).format(this.appConfig.userFormat);
          }

        }
        this.appService.loaderStatus('none');
      } else {
        this.allStatements = [];
        this.appService.loaderStatus('none');
      }

    })
  }

  // function to create income and expence statement
  
  createIncomeOrExpence() {
    this.appService.loaderStatus('block');
    if (this.incomeExpenceForm && this.incomeExpenceForm.status == 'VALID') {
      this.appService.manageHttp('post', 'statements', this.incomeExpenceForm.value).subscribe(res => {
        if (res && res.respMessage && res.respCode) {
          this.getIncomeAndExpencesStatements();
          $('#incomeExpense').modal('hide');
          this.tostr.success(res.respMessage);
        } else if (res && res.errorMessage) {
          this.appService.loaderStatus('none');
          this.tostr.error(res.errorMessage);

        }
      }, (error) => {
        this.appService.loaderStatus('none');
        this.tostr.error('Something Went Wrong');
      })
    } else {
      this.appService.loaderStatus('none');
      this.submitted = true;
    }
  }

  //function to do operations when click on addIncomeExpense
  onClickAddIncomeExpense() {
    this.submitted = false;
    this.incomeExpenceForm.reset();
    this.incomeExpenceData = {};
    $('#incomeExpense').modal({ backdrop: 'static', keyboard: false }, 'show');
  }

}
