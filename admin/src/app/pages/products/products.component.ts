import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
declare var $;

@Component({
  selector: 'az-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  products: any = [];
  totalRecords: any;
  productData: any;
  productId: any;
  columns: any;
  objectKeys = Object.keys;
  imagesPath = this.appConfig.imageUrl + 'entity/';
  BestSellers: any;
  queryParamOwnerId: any;
  exportFileCount: any = 0;
  entityType: string;
  type: string;
  accessStatus:string;
  productStatus:any=[];
  constructor(public router: Router, public appService: AppService,
    public appConfig: AppConfig, public toastr: ToastrService, public activatedRoute: ActivatedRoute) {
    this.queryParamOwnerId = this.activatedRoute.snapshot.queryParams["ownerId"];
    this.getLocalStorageData();

    this.productStatus = [
      { label: 'All', value: null },
      { label: 'Active', value: 'Active' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Blocked', value: 'Blocked' }
    ];
    this.columns = [
      { header: 'Name', field: 'name' },
      { header: 'ShortDesc', field: 'shortDesc' },
      { header: 'VisibleDate', field: 'visibleDate' },
      { header: 'ExpiryDate', field: 'expiryDate' },
      { header: 'Created', field: 'created' },
      { header: 'categories', field: 'multipleCategories' },
      { header: 'CreatedBy', field: 'createdBy.employee.displayName' }
    ];

  }


  //  Function to get all Products
  getAllProducts(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['name', 'shortDesc', 'visibleDate', 'expiryDate', 'categories', 'created', 'ownerName', 'productfilter'
      , 'totalAvailable','status'];
    if (event && event.filters && event.filters.hasOwnProperty('totalAvailable')) {
      event.filters.totalAvailable.searchFormatType = "Number";
    }

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

    if (this.queryParamOwnerId) {
      filterCriteria['criteria'].push({
        "key": "ownerId", "value": this.queryParamOwnerId, "type": "eq"
      });
    }
    var type = '?loginType=' + this.entityType;
    URL = 'entities' + type + '&filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.entities) {
        this.products = res.entities;

        for (let i = 0; i < this.products.length; i++) {
          if (event && event.first) {
            this.products[i].srNo = (i + 1) + event.first;
          }
          else {
            this.products[i].srNo = i + 1;
          }
          if (this.products[i].createdBy.user) {
            this.products[i].createdBy = this.products[i].createdBy.user;
          }
          if (this.products[i].createdBy.employee) {
            this.products[i].createdBy = this.products[i].createdBy.employee;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        this.appService.loaderStatus('none');
      } else {
        this.products = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })

  }



  //  Function for onClickAction on add, edit, update and delete

  onClickAction(type, product?: any) {
    if (product && product._id) {
      this.productId = product._id;
      if (type === 'view') {
        //this.productData = product;
        this.getProductById(product._id);
      } else if (type === 'delete') {
        $('#deleteProduct').modal('show');
      } else if (type === 'Approve') {
        this.type='Approve';
        this.accessStatus='Active';
        $('#BlockOrActivateProduct').modal('show');
      }else if (type === 'Block') {
        this.type='Block';
        this.accessStatus='Blocked';
        $('#BlockOrActivateProduct').modal('show');
      }

    }
  }


  blockOrActivateProduct(type) {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'entities/' + this.productId + '?type=' + type, {}).subscribe(res => {
      if (res && res.respCode === 205) {
        $('#BlockOrActivateProduct').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getAllProducts();
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

  // Get Product By Id
  getProductById(id) {
    this.appService.manageHttp('get', 'entities' + '/' + this.productId, '').subscribe(res => {
      if (res && res.details) {
        this.productData = res.details;
        if (this.productData.inventories && this.productData.inventories.length > 0) {
          for (var i = 0; i < this.productData.inventories.length; i++) {
            delete this.productData.inventories[i].MRPCurrency;
            delete this.productData.inventories[i].Currency;
          }
        }
        //  this.inventory = this.productDetails.inventories[0];        
        $('#viewProduct').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else {
        this.productData = [];
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  // Function to delete Product
  deleteProduct() {
    this.appService.manageHttp('delete', 'entities' + '/' + this.productId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.toastr.success(res.respMessage);
        $('#deleteProduct').modal('hide');
        this.getAllProducts();
      } else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
  }

  //Export Csv for products
  exportCSV() {
    this.appService.loaderStatus('block');
    var Url = 'entities';
    this.appService.manageHttp('get', Url, '').subscribe(res => {
      if (res && res.entities && res.entities.length > 0) {
        for (var i = 0; i < res.entities.length; i++) {
          if (res.entities[i].visibleDate) {
            res.entities[i].visibleDate = this.appService.getDisplayDateFormat(res.entities[i].visibleDate);
          }
          if (res.entities[i].expiryDate) {
            res.entities[i].expiryDate = this.appService.getDisplayDateFormat(res.entities[i].expiryDate);
          }
          if (res.entities[i].created) {
            res.entities[i].created = this.appService.getDisplayDateFormat(res.entities[i].created);
          }
          // if (res.entities[i].multipleCategories) {
          //   res.entites[i].multipleCategories = res.entities[i].multipleCategories;
          // }
          // if (res.entities[i].inventories) {
          //    res.entites[i].inventories = res.entites[i].inventories.map( obj =>{
          //      delete obj.Currency;
          //      delete obj.MRPCurrency;
          //    });
          // }
        }

        let filterLabels = ['name', 'ownerName', 'shortDesc', 'brandName', 'buxPercentage', 'euroPercentage', 'expiryDate', 'visibleDate',
          'totalAvailable', 'reviewsCount', 'multipleCategories', 'inventories', 'images', 'created', 'createdBy'];
        var data = this.appService.handleNull(res.entities);
        this.exportFileCount += 1;
        this.appService.exportToCSV(data, filterLabels, 'Entities', this.exportFileCount, '');
        this.appService.loaderStatus('none');
      } else {
        this.appService.loaderStatus('none');
      }
    });
  }

  // deleteInventory(data){
  //  console.log(data);
  // }

  //Get Local storage
  getLocalStorageData() {
    if (localStorage.getItem('entityType')) {
      this.entityType = localStorage.getItem('entityType');
    }
  }

}
