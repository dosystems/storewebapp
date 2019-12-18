import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
declare var $;

@Component({
  selector: 'az-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportType: any;
  BestSellers: any = [];
  sellersCsv: any = [];
  totalRecords: number;
  sellersProducts: any = [];
  sellersProductsCsv: any = [];
  queryParamId: any;
  mostViewed: any = [];
  exportCsv: any = [];
  totalReviews: any = [];
  ReviewsCsv: any = [];
  reviewData: any = {};
  Id: any;
  type: string;
  entityId: any;
  customerId: any;
  RequestCategories: any = [];
  rejectForm: FormGroup;
  rejectId: any;
  submitted:boolean;
  Status:any = [];
  RequestCategoriesCsv:any;
  categoryForm: FormGroup;
  globalCategories: any = ['Products', 'Services', 'Deals'];
  disabled: boolean;
  categoryData:any = {};
  categorySelected: boolean = false;
  levels: any = [];
  categories:any =[];
  aprrovalData:any ={};
  selectedCategory: any;

  constructor(public fb: FormBuilder, public router: Router, public appService: AppService, public activatedroute: ActivatedRoute, public appConfig: AppConfig, public toastr: ToastrService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    activatedroute.params.subscribe(p => { this.reportType = p['reportType'] });
    if (this.reportType === 'sellerProducts') {
      this.queryParamId = this.activatedroute.snapshot.queryParams["ID"];
    }
    if (this.reportType === 'reviews') {
      activatedroute.queryParams.subscribe(p => { this.Id = p['id'], this.type = p['type'] });
      if (this.type == 'entity') {
        this.entityId = this.Id;
      } else if (this.type == 'customer') {
        this.customerId = this.Id;
      }
    }
    this.rejectForm = fb.group({
      reason: ['',Validators.required]
    });
    this.categoryForm = fb.group({
      globalCategory: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.sellersCsv = [
      { header: 'S.no', field: 'srNo' },
      { header: 'Total Products', field: 'count' },
      { header: 'Total Amount', field: 'totalAmount' },
      { header: 'Owner', field: '_id.ownerName' }
    ];
    this.sellersProductsCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Product ', field: 'entityName' },
      { header: 'Seller', field: 'ownerName' },
      { header: 'Buyer', field: 'userName' },
      { header: 'Status', field: 'status' },
      { header: 'Price', field: 'inventory.Price' },
      { header: 'Size', field: 'inventory.Size' },
      { header: 'Color', field: 'inventory.Color' },
      { header: 'Created', field: 'created' },
      { header: 'CreatedBy', field: 'createdBy.name' }
    ];
    //ExportCsv
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Count', field: 'count' },
      { header: 'Product', field: '_id.name' }
    ]
    this.ReviewsCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Review ', field: 'comment' },
      { header: 'Rating', field: 'rating' },
      { header: 'Product', field: 'entityName' },
      { header: 'Buyer', field: 'createdBy.name' },
      { header: 'Created', field: 'created' }
    ]
   //For Dropdown To requested Categories
    this.Status = [
      { label: 'All', value: null },
      { label: 'Approved', value: 'Approved' },
      { label: 'Rejected', value: 'Rejected' },
      { label: 'Returned', value: 'returned' }
    ];
    this.RequestCategoriesCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Category ', field: 'category' },
      { header: 'Reviewed By', field: 'createdBy.name' },
      { header: 'Created', field: 'created' },
       { header: 'Status', field: 'status' }
    ]
  }


  // For view modal box
  ViewModal(data) {
    if (data) {
      this.reviewData = JSON.parse(JSON.stringify(data));
      $('#openReviewDetailsModal').modal({ backdrop: 'static', keyboard: false }, 'show');
    }
  }


  //Get Call For BestSellers 
  getBestSellers(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['count', 'totalAmount', '_id.ownerName'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    URL = 'reports/bestSeller' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res) {
        this.BestSellers = res.bestSeller;
        for (let i = 0; i < this.BestSellers.length; i++) {
          if (event && event.first) {
            this.BestSellers[i].srNo = (i + 1) + event.first;
          }
          else {
            this.BestSellers[i].srNo = i + 1;
          }
        }
        this.appService.loaderStatus('none');
      }
      else {
        this.BestSellers = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  }

  //Get Seller Products By OwnerId 
  getSellerProducts(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['quantity', 'ownerName', 'userName', 'entityName', 'status', 'inventory.Color', 'inventory.Price', 'created'
      , 'createdBy.name'];
    if (event && event.filters && event.filters.hasOwnProperty('quantity')) {
      event.filters.quantity.searchFormatType = "Number";
    }
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
    filterCriteria.criteria.push({ "key": "status", "value": ["Paid", "Processing", "Shipped", "Delivered", "Completed"], "type": "in" },
      { "key": "ownerId", "value": this.queryParamId, "type": "eq" });
    URL = 'orders' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.orders) {
        this.sellersProducts = res.orders;
        for (let i = 0; i < this.sellersProducts.length; i++) {
          if (event && event.first) {
            this.sellersProducts[i].srNo = (i + 1) + event.first;
          }
          else {
            this.sellersProducts[i].srNo = i + 1;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        this.appService.loaderStatus('none');
      } else {
        this.sellersProducts = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  }

  //Most Viewed Products
  getMostViewPro(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['name'];
    if (event && event.filters && event.filters.hasOwnProperty('count')) {
      event.filters.count.searchFormatType = "Number";
    }
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
    URL = 'reports/mostlyViewed' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.mostleyViewed) {
        this.mostViewed = res.mostleyViewed;
        for (let i = 0; i < this.mostViewed.length; i++) {
          if (event && event.first) {
            this.mostViewed[i].srNo = (i + 1) + event.first;
          }
          else {
            this.mostViewed[i].srNo = i + 1;
          }
        }
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      }
      else {
        this.mostViewed = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  // Get Call For TotalReviews
  getTotalReviews(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['title', 'rating', 'entityName', 'createdBy.name', 'created', 'userName','comment'];
    if (event && event.filters && event.filters.hasOwnProperty('rating')) {
      event.filters.rating.searchFormatType = "Number";
    }
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    if (this.entityId) {
      filterCriteria = { "criteria": [{ "key": "entityId", "value": this.entityId, "type": "eq" }] };
    }
    if (this.customerId) {
      filterCriteria = { "criteria": [{ "key": "userId", "value": this.customerId, "type": "eq" }] };
    }
    URL = 'reviews' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.reviews) {

        this.totalReviews = res.reviews;

        for (let i = 0; i < this.totalReviews.length; i++) {
          if (event && event.first) {
            this.totalReviews[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalReviews[i].srNo = i + 1;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalReviews = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  //Get All Requeseted  Categories From Vendors
  getRequestedCategories(event?: any) {
    let URL;
    let filterCriteria;
    let filterLabels = ['category', 'createdBy.name', 'created', 'status'];
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
    URL = 'categoryRequest' + '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res && res.categoryRequests) {
        this.RequestCategories = res.categoryRequests;
        for (let i = 0; i < this.RequestCategories.length; i++) {
          if (event && event.first) {
            this.RequestCategories[i].srNo = (i + 1) + event.first;
          }
          else {
            this.RequestCategories[i].srNo = i + 1;
          }
        }
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      }
      else {
        this.RequestCategories = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  //For Approving the Request
  onApproved(Data) {
    $('#addCategory').modal({ backdrop: 'static', keyboard: false },'show');
     this.aprrovalData = JSON.parse(JSON.stringify(Data));
  }

//For Approval of category after category is created
  ApproveCategory(){
    this.aprrovalData.status = "Approved";
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'categoryRequest/' + this.aprrovalData._id, this.aprrovalData).subscribe(res => {
      if (res && res.respCode === 205) {
        setTimeout(()=>{
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.respMessage);
        this.getRequestedCategories();
        },2000);
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  //For Rejecting With Reason
  RejectRequestCategory(rejectForm) {
    if(this.rejectForm.status === 'INVALID'){
      this.submitted = true;
      return;
    }
    rejectForm.value.status = "Rejected";
    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'categoryRequest/' + this.rejectId, rejectForm.value).subscribe(res => {
      if (res && res.respCode === 205) {
         this.appService.loaderStatus('none');
        $('#Reason').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getRequestedCategories();
      } else {
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  // For Rejecting With Reason
  onReject(data) {
    this.rejectForm.reset();
    this.submitted = false;
    this.rejectId = data._id;
    $('#Reason').modal({ backdrop: 'static', keyboard: false }, 'show');
  }

  // to create Or Update Category

  CreateOrUpdateCategory(categoryForm) {
    if (!this.categorySelected) {
      this.submitted = true;
      return;
    }
    if (categoryForm.invalid) {
      this.submitted = true;
      return;
    }
    let categories = [];
    for (var i = 0; i < this.levels.length; i++) {
      if (this.levels[i].value != "") {
        categories.push(this.appService.capitalize(this.levels[i].value));
      }
    }
    this.disabled = true;
    let obj = { 'categories': categories };
    this.appService.manageHttp('post', 'categories/multipleCategories', obj).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.appService.displayToasterMessage(res.respMessage);
        this.disabled = false;
        $('#addCategory').modal('hide');
        this.ApproveCategory();
      } else {
        this.disabled = false;
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    })

  }


  // to add levels to category  
  addLevel() {
    this.submitted = false;
    this.levels.push({ value: '' });
  }

  // to  Search previous Categories

  getAllCategoriesInSearch(event: any) {
    if (event && event.query) {
      var URL = 'categories' + '?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.categories = res.categories;
        } else {
          this.categories = [];
        }
      });
    }
  }

  // on selecting category in Auto complete

  selectCategory(event) {
    this.levels = [];
    if (event && event.tree) {
      var tree = event.tree.split("-");
      for (var i = 0; i < tree.length; i++) {
        if (tree[i]) {
          if (!this.levels[i]) {
            this.addLevel();
          }
          this.levels[i].value = tree[i];
        }
      }
      this.categorySelected = true;
    } else {
      this.categorySelected = false;
    }

  }

}
