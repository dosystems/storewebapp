import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  serverUrl = 'activities';
  totalActivities: any = [];
  totalRecords: any;
  exportCsv: any = [];
  constructor(public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {

  }

  ngOnInit() {

    this.exportCsv = [

    ];
  }
  getAllActivitie(event?: any) {

    let filterCriteria;
    let filterLabels = ['contextType', 'desc', 'value', 'created'];
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
      if (res) {

        this.totalActivities = res.activities;
        for (let i = 0; i < this.totalActivities.length; i++) {
          if (event && event.first) {
            this.totalActivities[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalActivities[i].srNo = i + 1;
          }
          if (this.totalActivities[i].createdBy.user) {
            this.totalActivities[i].createdBy = this.totalActivities[i].createdBy.user;
          }
          if (this.totalActivities[i].createdBy.employee) {
            this.totalActivities[i].createdBy = this.totalActivities[i].createdBy.employee;
          }
          if (this.totalActivities[i].created) {
            this.totalActivities[i].created = moment(this.totalActivities[i].created).format(this.appConfig.userFormat);
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('went something wrong');
      this.appService.loaderStatus('none');
    })
  }

}
