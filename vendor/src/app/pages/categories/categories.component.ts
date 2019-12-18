import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  totalCategories: any = [];
  serverUrl = 'categories';
  categoryData: any = {};
  categoryForm: FormGroup;
  exportCsv: any = [];
  totalRecords: any;
  levels: any = [];
  categories: any;
  categorySelected: boolean = false;
  submitted: any;
  categoryId: any;
  disabled: boolean;
  selectedCategory: any;
  globalCategories: any = ['Products', 'Services', 'Home And Auto'];
  constructor(fb: FormBuilder, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.categoryForm = fb.group({
      globalCategory: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.exportCsv = [
      { header: 'Name', field: 'name' },
      { header: 'Parent', field: 'parent' },
      { header: 'Tree', field: 'tree' }
    ];
  }

  // to get  All Categories
  getAllCategories(event?: any) {

    let filterCriteria;
    let filterLabels = ['name', 'parent', 'tree', 'created'];
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
      if (res.categories && res.categories.length > 0) {
        this.totalCategories = res.categories;

        for (let i = 0; i < this.totalCategories.length; i++) {
          if (event && event.first) {
            this.totalCategories[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalCategories[i].srNo = i + 1;
          }
          if (this.totalCategories[i].created) {
            this.totalCategories[i].created = moment(this.totalCategories[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalCategories = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })
  }



  // on click actions to add, edit,delete
  onClickActions(type, category?: any) {
    if (type === 'add') {
      this.levels = [];
      this.categoryId = '';
      this.selectedCategory = {};
      $('#addOrEditCategory').modal({ backdrop: 'static', keyboard: false }, 'show');
    }
    else {
      this.categoryId = category._id;
      if (type === 'edit') {
        this.getCategoryById(this.categoryId);
        setTimeout(() => {
          $('#addOrEditCategory').modal({ backdrop: 'static', keyboard: false }, 'show');
        }, 200);
      }
      if (type === 'view') {
        this.getCategoryById(this.categoryId);
        $('#viewCategory').modal('show');
      }
      if (type === 'delete') {
        $('#deleteCategory').modal('show');
      }
    }

  }





  // to add levels to category  
  addLevel() {
    this.levels.push({ value: '' });
  }


  // to  Search previous Categories

  getAllCategoriesInSearch(event: any) {
    if (event && event.query) {
      var URL = this.serverUrl + '?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
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
    }

  }



  // to create Or Update Category

  CreateOrUpdateCategory(categoryForm) {
    if (!this.categorySelected && !this.categoryId) {
      this.submitted = true;
      return;
    }
    if (categoryForm.invalid && !this.categoryId) {
      this.submitted = true;
      return;
    }
    let categories = [];
    for (var i = 0; i < this.levels.length; i++) {
      if (this.levels[i].value != "") {
        categories.push(this.appService.capitalize(this.levels[i].value));
      } else {
        this.submitted = true;
        return;
      }

    }
    this.disabled = true;
    let method;
    let Url;
    if (this.categoryId) {
      method = 'put'
      Url = 'categories' + '/' + this.categoryId;
    } else {
      method = 'post'
      Url = 'categories/multipleCategories';
    }
    let obj = { 'categories': categories };
    this.appService.manageHttp(method, Url, obj).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.toastr.success(res.respMessage);
        this.disabled = false;
        this.getAllCategories();
        $('#addOrEditCategory').modal('hide');
      } else {
        this.disabled = false;
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })

  }







  // to get Category by Id

  getCategoryById(id) {
    this.levels = [];
    this.categoryData = {};
    if (id) {
      this.appService.loaderStatus('block');
      this.appService.manageHttp('get', 'categories/' + id, '').subscribe((res) => {
        if (res && res.details) {
          this.categoryData = res.details;
          if (this.categoryData && this.categoryData.created) {
            this.categoryData.created = moment(this.categoryData.created).format(this.appConfig.userFormat)
          }
          if (this.categoryData.tree) {
            var tree = this.categoryData.tree.split("-");
            if (tree && tree.length > 0) {
              for (var i = 0; i < tree.length; i++) {
                if (tree[i]) {
                  if (!this.levels[i]) {
                    this.addLevel();
                  }
                  this.levels[i].value = tree[i];
                }
              }
            }
          }
        }
        this.appService.loaderStatus('none');
      });
    }

  }



  // to delete a category 

  deleteCategory() {
    this.appService.manageHttp('delete', 'categories' + '/' + this.categoryId, '').subscribe(res => {
      if (res && res.respCode === this.appService.respCode206) {
        this.toastr.success(res.respMessage);
        $('#deleteCategory').modal('hide');
        this.getAllCategories();
      } else if (res && res.respCode === 9001) {
        this.toastr.error(res.errorMessage);
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
    })
  }





}
