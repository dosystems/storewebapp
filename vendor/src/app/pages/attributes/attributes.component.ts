import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
declare var $;

@Component({
  selector: 'az-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent {
  attributes: any = [];
  totalRecords: any;
  attributeId: any;
  disabled:boolean;
  attribute:any={};
  form: FormGroup;
  submitted:any;
  columns:any;
  constructor(fb: FormBuilder, public router: Router, public appService: AppService,
    public appConfig: AppConfig, public toastr: ToastrService) {
    this.form = fb.group({
      name:['',Validators.required]
    });
  }

  //  Function to get all attributes
  getAllAttributes(event?: any) {


    let filterCriteria;
    let filterLabels = ['name','created'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    let URL = 'attributes' + '?filter=' + JSON.stringify(filterCriteria);
   
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res.attributes && res.attributes.length > 0) {
        this.attributes = res.attributes;
        let sNo;
        if (event) {
          sNo = event.first;
        } else {
          sNo = 0;
        }
        for (let i = 0; i < this.attributes.length; i++) {
          sNo = sNo + 1;
          this.attributes[i].srNo = sNo;
          if (this.attributes[i].created) {
            this.attributes[i].created = moment(this.attributes[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }

        this.appService.loaderStatus('none');
      } else {
        this.attributes = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    })

  }



  //  Function for onClickAction on add, edit, update and delete

  onClickAction(type, attribute?: any) {
    if (type === 'add') {
      this.attributeId='';
      this.attribute={};
      $('#addOrEditAttribute').modal({ backdrop: 'static', keyboard: false }, 'show');
    }
    else {
      this.attributeId = attribute._id;
      if (type === 'edit') {
        this.attribute=attribute;
        $('#addOrEditAttribute').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else if (type === 'delete') {
        $('#deleteAttribute').modal('show');
      }
    }
  }


  // Function to delete attribute
  deleteAttribute() {
    this.appService.manageHttp('delete', 'attributes' + '/' + this.attributeId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        this.toastr.success(res.respMessage);
        $('#deleteAttribute').modal('hide');
        this.getAllAttributes();
      } else if (res && res.respCode === 9001) {
        this.toastr.error(res.errorMessage);
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
    })
  }


  CreateOrUpdateAttribute(form){
    if (form.invalid) {
      this.submitted = true;
      return;
    }    
    this.disabled = true;
    let method;
    let Url;
    if (this.attributeId) {
      method = 'put'
      Url = 'attributes' + '/' + this.attributeId;
    } else {
      method = 'post'
      Url = 'attributes';
    }
    if(form.value.name){
      form.value.name=this.appService.capitalize(form.value.name);
    }
    
    this.appService.manageHttp(method, Url, form.value).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 ||res.respCode == this.appService.respCode205) {
        this.toastr.success(res.respMessage);
        this.disabled = false;
        this.getAllAttributes();
        $('#addOrEditAttribute').modal('hide');
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


}
