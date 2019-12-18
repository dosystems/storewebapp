import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import * as moment from 'moment/moment';
declare let $;

@Component({
  selector: 'az-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})
export class NewsletterComponent implements OnInit {
  newsLetterPath = this.appConfig.imageUrl + 'newsLetter/';
  totalNewsLetter: any = [];
  serverUrl: string = 'newsLetters';
  totalRecords: number;
  newsForm: FormGroup;
  newsLetterData: any = {};
  submitted: boolean;
  Id: any;
  exportCsv: any = [];
  constructor(public fb: FormBuilder, public activatedRoute: ActivatedRoute, public router: Router, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.newsForm = fb.group({
      name: ['', Validators.required],
      subject: ['', Validators.required],
      data: ['']
    });
    this.summerNote();
  }

  ngOnInit() {
    this.exportCsv = [
      { header: 'S.No ', field: 'srNo' },
      { header: 'Name ', field: 'name' },
      { header: 'Description', field: 'data' },
      { header: 'Subject', field: 'subject' }
    ];
  }

  //Get Editor For SummerNote
  summerNote() {
    let that = this;
    $(function () {
      $('#summernote').summernote({
        tabsize: 2,
        height: 200,
        placeholde: 'Type News Letter',
        maximumImageFileSize: 1572864,
        callbacks: {
          onImageUpload: function (image) {
            that.imageUpload(image[0], 'description');
          }
        },
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontsize', ['fontsize']], // Still buggy
          ['color', ['color']],
          ['insert', ['link', 'picture']],
          ['misc', ['emoji']],
          ['view', ['fullscreen', 'codeview']],
          ['table', ['table']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['color', ['color']]
        ]
      });
    });
  }

  //On Image Upload
  imageUpload(input: any, type) {
    if (type === 'description') {
      let image = input;
      this.appService.loaderStatus('block');
      var photoPath = this.appService.fileUpload(image, 'file', 'newsLetters/uploadImages');
      photoPath.subscribe((res) => {
        if (res) {
          var response = res;
        }
        if (response && response.respCode && response.respCode === this.appService.respCode204) {
          this.toastr.success(response.respMessage);
          this.appService.loaderStatus('none');
          let files = response.fileName[0].name;
          var insertImg = $('<img style="width: 100%;" src="' + this.newsLetterPath + files + '" />');
          $('#summernote').summernote('insertNode', insertImg[0]);
        } else {
          this.appService.loaderStatus('none');
        }
      }, (error) => {
        this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
      });
    }


  }
  //onClick Actions
  onClickActions(type?: any, data?: any) {
    this.newsLetterData = {};
    this.submitted = false;
    this.newsForm.reset();
    if (type === 'add') {
      $('#summernote').summernote('code', '');
      $('#AddOrEdit').modal({ backdrop: 'static', keyboard: false }, 'show');
    } else if (data) {
      this.newsLetterData = JSON.parse(JSON.stringify(data));
      this.Id = this.newsLetterData._id;
      if (type === 'edit') {
        $(' .note-editable')[0].innerHTML = this.newsLetterData.data;
        $('#AddOrEdit').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else if (type === 'delete') {
        $('#delete').modal({ backdrop: 'static', keyboard: false }, 'show');
      }
    }
  }

  //Get totalNews Letters
  getTotalNewsLetters(event?: any) {
    let filterCriteria;
    let filterLabels = ['data', 'name', 'subject'];
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
      if (res && res.newsLetters) {
        this.totalNewsLetter = res.newsLetters;
        for (let i = 0; i < this.totalNewsLetter.length; i++) {
          if (event && event.first) {
            this.totalNewsLetter[i].srNo = (i + 1) + event.first;
          }
          else {
            this.totalNewsLetter[i].srNo = i + 1;
          }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        }
        this.appService.loaderStatus('none');
      } else {
        this.totalNewsLetter = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    });
  }

  //Create Or update
  createOrUpdate(newsForm) {
    if (this.newsForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    let method;
    let Url;
    if (this.newsLetterData._id) {
      method = 'put';
      Url = this.serverUrl + '/' + this.newsLetterData._id;
    } else {
      method = 'post';
      Url = this.serverUrl
    }
    if ($('#description .note-editable') && $('#description .note-editable')[0] && $('#description .note-editable')[0].innerHTML) {
      newsForm.value.data = $('#description .note-editable')[0].innerHTML;
    }
    if (newsForm.value.name && newsForm.value.subject) {
      newsForm.value.name = this.appService.capitalize(newsForm.value.name);
      newsForm.value.subject = this.appService.capitalize(newsForm.value.subject);
    }
    if (this.newsLetterData.type) {
      newsForm.value.type = this.newsLetterData.type;
    }
    this.appService.loaderStatus('block');
    this.appService.manageHttp(method, Url, newsForm.value).subscribe(res => {
      if (res && res.respMessage) {
        this.appService.displayToasterMessage(res.respMessage);
        $('#AddOrEdit').modal('hide');
        this.getTotalNewsLetters();
        this.appService.loaderStatus('none');
      } else if (res && res.errorMessage) {
        this.appService.displayToasterMessage(res.errorMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.loaderStatus('none');
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });

  }
  //Delete News Letter
  deleteNewsLetter() {
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.Id, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#delete').modal('hide');
        this.appService.displayToasterMessage(res.respMessage);
        this.getTotalNewsLetters();
      } else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error')
    });
  }


}
