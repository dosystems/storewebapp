import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { AppConfig } from '../../app.config';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment/moment';


declare var $: any;

@Component({
  selector: 'az-anouncements',
  templateUrl: './anouncements.component.html',
  styleUrls: ['./anouncements.component.scss']
})
export class AnouncementsComponent {
  announceData: any = {};
  submitted: boolean;
  totalRecords: number = 0;
  allAnnouncements: any = [];
  deleteAnnounceId: any;

  constructor(public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.getEditor();
  }


  //Summernote editor settings
  getEditor() {
    let that = this;
    $(function () {
      $('.summernote').summernote({
        height: 250,
        focus: true,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']], // Still buggy
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['view', ['fullscreen', 'codeview']],
          ['help', ['help']],
          ['misc', ['emoji']],
          ['insert', ['link', 'picture']]
        ]
      });
    });
  }

  //For create and update announcements
  createUpdateAnnouncement() {
    this.appService.loaderStatus('block');
    if ($('#description .note-editable') && $('#description .note-editable')[0] && $('#description .note-editable')[0].innerHTML) {
      this.announceData.text = $('#description .note-editable')[0].innerHTML;
    }
    if (this.announceData.header && this.announceData.text) {
      let callType, url;
      if (this.announceData._id) {
        callType = 'put';
        url = 'announcements/' + this.announceData._id;
      } else {
        callType = 'post';
        url = 'announcements'
      }
      this.appService.manageHttp(callType, url, this.announceData).subscribe(res => {
        if (res && res.respMessage) {
          this.getAllAnnouncement();
          this.toastr.success(res.respMessage);
          $('#announcementModal').modal('hide')
        } else if (res && res.errorMessage) {
          this.toastr.error(res.errorMessage);
          this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.appService.loaderStatus('none');
        this.toastr.error('Something Went Wrong');
        this.appService.loaderStatus('none');
      });

    } else {
      this.appService.loaderStatus('none');
      this.submitted = true
    }
  }

  //function to get all the announcement list  
  getAllAnnouncement(event?: any) {
    let filterCriteria;
    let filterLabels = ['header', 'type', 'created'];
    filterCriteria = this.appService.EventData(event, filterLabels);
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }
    let url = 'announcements?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', url, '').subscribe(res => {
      if (res && res.announcements && res.announcements.length && res.announcements.length > 0) {
        this.allAnnouncements = res.announcements;
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        for (let i = 0; i < this.allAnnouncements.length; i++) {
          if (event && event.first) {
            this.allAnnouncements[i].sNo = (i + 1) + event.first;
          }
          else {
            this.allAnnouncements[i].sNo = i + 1;
          }
          if (this.allAnnouncements[i].created) {
            this.allAnnouncements[i].created = moment(this.allAnnouncements[i].created).format(this.appConfig.userFormat);
          }
        }
        this.appService.loaderStatus('none');
      } else {
        this.allAnnouncements = [];
        this.appService.loaderStatus('none');
      }
    })
  }

  //Function to delete announcements
  deleteAnnouncement() {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', 'announcements/' + this.deleteAnnounceId, '').subscribe(res => {
      if (res && res.respMessage) {
        this.getAllAnnouncement()
        this.toastr.success(res.respMessage);
        $('#deleteAnnounce').modal('hide');
      } else if (res && res.errorMessage) {
        this.toastr.error(res.errorMessage);
        this.appService.loaderStatus('none');
      }

    })
  }

  //Funtion to view announcement
  viewAnnounement(data) {
    this.announceData = data;
    $('#viewAnnouncementModal').modal({ backdrop: 'static', keyboard: false }, 'show');
  }

  //Function to execute when click on add and edit 
  addOrEditAnnouncement(data?: any) {
    this.submitted = false;
    this.announceData = {};
    $('#description .note-editable')[0].innerHTML = '';
    if (data && data._id) {
      this.announceData = JSON.parse(JSON.stringify(data));
      if (data.text) {
        $('#description .note-editable')[0].innerHTML = data.text;
      }
    }
    $('#announcementModal').modal({ backdrop: 'static', keyboard: false }, 'show');
  }
}
