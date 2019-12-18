import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
declare var $;

@Component({
  selector: 'az-exchangerates',
  templateUrl: './exchangerates.component.html',
  styleUrls: ['./exchangerates.component.scss']
})
export class ExchangeratesComponent implements OnInit {
  exchangeRates: any = [];
  exportCsv: any = [];
  serverUrl = 'exchangerates';
  totalRecords:number;
  constructor(public router: Router, public appService: AppService, public activatedroute: ActivatedRoute, public appConfig: AppConfig, public toastr: ToastrService) {

  }

  ngOnInit() {
    //Export Csv
    this.exportCsv = [
      { header: 'S.no', field: 'srNo' },
      { header: 'Pair', field: 'pair' },
      { header: 'From Currecny', field: 'fromCurrency' },
      { header: 'To Currency', field: 'toCurrency' },
      { header: 'buyRate', field: 'buyRate' },
      { header: 'sellRate', field: 'sellRate' },
      { header: 'Created', field: 'created' }

    ]
  }
  //Getting List Call Fro Excahnge Rates
  getExchangeRates(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['pair','fromCurrency','toCurrency','buyRate','sellRate','created','fee'];
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
      if (res && res.exchangerates) {
        this.exchangeRates = res.exchangerates;
        for (let i = 0; i < this.exchangeRates.length; i++) {
          if (event && event.first) {
            this.exchangeRates[i].srNo = (i + 1) + event.first;
          }
          else {
            this.exchangeRates[i].srNo = i + 1;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        } 
        this.appService.loaderStatus('none');
      }
      else {
        this.exchangeRates = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  } //End of List Call

}
