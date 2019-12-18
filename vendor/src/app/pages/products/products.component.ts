import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router,ActivatedRoute } from '@angular/router';
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
  id: any;
  objectKeys = Object.keys;
  type:any;
  entityType:string;
  productStatus:any=[];
  constructor(public router: Router, public appService: AppService,
    public appConfig: AppConfig, public toastr: ToastrService,public activatedRoute:ActivatedRoute) {
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
      { header: 'categories', field: 'multipleCategories' }

    ];
  
    this.getLocalStorageData();
  }

  //  Function to get all Products
  getAllProducts(event?: any) {
    if(this.activatedRoute.snapshot.queryParams["type"]){
      this.type = this.activatedRoute.snapshot.queryParams["type"];
    } else {
      this.type = '';      
    }
    let filterCriteria;
    let filterLabels = ['name', 'shortDesc', 'visibleDate', 'expiryDate', 'categories', 'created', 'ownerName','status'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }

    if (!filterCriteria) {
      return;
    }
    if (filterCriteria && filterCriteria.criteria && filterCriteria.criteria.length > 0) {
      filterCriteria.criteria.push({ "key": "ownerId", "value": this.appService.loginVendorDetails._id, "type": "in" });
    } else {
      filterCriteria.criteria = [];
      filterCriteria.criteria.push({ "key": "ownerId", "value": this.appService.loginVendorDetails._id, "type": "in" });
    }
    let URL;
    if(this.type == 'lowStock'){
      URL = 'entities/getLowStockList?filter=' + JSON.stringify(filterCriteria);
    }else{
      var type = '?loginType=' + this.entityType;
      URL = 'entities'+ type +'&filter=' + JSON.stringify(filterCriteria);
    }    
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.entities) {
        // if (res && res.respCode==this.appService.respCode200) {
        this.products = res.entities;

        for (let i = 0; i < this.products.length; i++) {
          if (event && event.first) {
            this.products[i].srNo = (i + 1) + event.first;
          }
          else {
            this.products[i].srNo = i + 1;
          }
          if(this.products[i].inventories && this.products[i].inventories.length > 0){
            for(var j=0;j<this.products[i].inventories.length;j++){
              if(this.products[i].inventories[j].MRPCurrency)
               delete this.products[i].inventories[j].MRPCurrency;
               if(this.products[i].inventories[j].Currency)
               delete this.products[i].inventories[j].Currency; 
            }
          }
          /*         
                    if(this.products[i].createdBy.user){
                      this.products[i].createdBy = this.products[i].createdBy.user;
                    } 
                     if(this.products[i].createdBy.employee){
                       this.products[i].createdBy = this.products[i].createdBy.employee;
                     }*/
          if (this.products[i].visibleDate) {
            this.products[i].visibleDate = moment(this.products[i].visibleDate).format(this.appConfig.userFormat);
          }

          if (this.products[i].expiryDate) {
            this.products[i].expiryDate = moment(this.products[i].expiryDate).format(this.appConfig.userFormat);
          }
          if (this.products[i].created) {
            this.products[i].created = moment(this.products[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        this.appService.loaderStatus('none');
      } else {
        this.products = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })

  }



  //  Function for onClickAction on add, edit, update and delete

  onClickAction(type, product?: any) {
    if (type === 'add') {
      this.router.navigate(['/addnewproduct']);
    }
    else {
      this.productId = product._id;
      if (type === 'edit') {
        this.router.navigate(['/editproduct/' + product._id]);
      } else if (type === 'view') {
        this.productData = product;
        $('#viewProduct').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else if (type === 'delete') {
        $('#deleteProduct').modal('show');
      } else if (type === 'user') {
        this.router.navigate(['/userdetails/' + product.createdBy._id]);
      }

    }
  }


  // Function to delete Product
  deleteProduct() {
    this.appService.manageHttp('delete', 'entities' + '/' + this.productId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.toastr.success(res.respMessage);
        $('#deleteProduct').modal('hide');
        this.getAllProducts();
      } else if (res && res.respCode === 9001) {
        this.toastr.error(res.errorMessage);
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
    })
  }

//Get Local storage
  getLocalStorageData() {
    if (localStorage.getItem('vendor')) {
      let vendor = JSON.parse(localStorage.getItem('vendor'));
      if (vendor && vendor.vendor && vendor.vendor._id) {
        this.id = vendor.vendor._id;
      }
    }
    if (localStorage.getItem('entityType')) {
       this.entityType = localStorage.getItem('entityType');
       console.log(this.entityType);
    }

  }


}
