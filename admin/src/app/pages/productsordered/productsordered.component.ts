import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
declare let $;

@Component({
  selector: 'az-productsordered',
  templateUrl: './productsordered.component.html',
  styleUrls: ['./productsordered.component.scss']
})
export class ProductsorderedComponent implements OnInit {
   productsOrdered:any = [];
   totalRecords:number;
   pageNumber:number = 1;
   rows:number = 20;
   exportCsv:any = [];
  constructor( public router: Router, public appConfig: AppConfig, public appService: AppService,
    public activeRoute: ActivatedRoute,public toastr:ToastrService ) { }

  ngOnInit() {
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Quanttity', field: 'quantity' },
      { header: 'Total Amount', field: 'totalAmount' } ,
      { header: 'Product Name', field: '_id.name' }        
    ]
  }

    // For getting total Products
    getProductsOrdered(event?:any){ 
    let URL;
    let filterCriteria;
    let filterLabels = ['entityName','totalAmount'];
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
    
    URL = 'reports/productByOrder?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.produts) {
        this.productsOrdered = res.produts;
        for (let i = 0; i < this.productsOrdered.length; i++) {
          if (event && event.first) {
            this.productsOrdered[i].srNo = (i + 1) + event.first;
          }
          else {
            this.productsOrdered[i].srNo = i + 1;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        this.appService.loaderStatus('none');
      } else {
        this.productsOrdered = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })      
    }
}
