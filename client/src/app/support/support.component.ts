import { Component, OnInit } from '@angular/core';
import { AppService } from "../app.service";
import { AppConfig } from "../app.config";
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
declare var $: any;
declare var jQuery:any;
@Component({
  selector: 'ross-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent  {
  tickets: any = [];
  totalRecords: any;
  ticketDetails: any = {};
  form: any;
  replyForm: any;
  submitted: any = false;
  pageNumber: number = 0;
  ticketId: any;
  public chatList: Array<any>;
  public reply: string = '';
  categoryList: any;
  loggedInUserId: any;
  modalHeight: any;
  categoryTypes: any = [];
  disableSubmitButton: boolean = false;
  
  
  constructor( private fbld: FormBuilder, public route: Router, public appService: AppService, public router: Router, private toastrService: ToastrService, activatedroute: ActivatedRoute, public appConfig: AppConfig) {
    this.loggedInUserId = this.appService.loginEmpDetails._id;
    this.categoryList = ['Finance', 'Technical', 'Support'];

    // To display category types 
    this.categoryTypes = [];
    this.categoryTypes.push({ label: 'All', value: null });
    this.categoryTypes.push({ label: 'Finance', value: 'Finance' });
    this.categoryTypes.push({ label: 'Technical', value: 'Technical' });
    this.categoryTypes.push({ label: 'Support', value: 'Support' });

    this.form = this.fbld.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
      category: ['', Validators.required],
      ticketId: ['']

    });

    this.replyForm = this.fbld.group({
      reply: ['', Validators.required]
    });
  }

  // To add ticket
  addTicket(form: any) {
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    } else {
      if (form && form.value) {
        this.appService.loaderStatus('block');
        this.disableSubmitButton = true;
        form.value.status = 'New';
        this.appService.manageHttp('post', 'tickets', form.value).subscribe((res) => {
          if (res && res.respCode && res.respCode === 204) {
            $('#ticketDetailsAddModal').modal('hide');
            this.form.reset();
            this.appService.loaderStatus('none');
            this.disableSubmitButton = false;
            this.getAllTickets();
            this.submitted = false;
            this.toastrService.success(res.respMessage);
          } else {
            this.appService.loaderStatus('none');
            this.disableSubmitButton = false;
            this.toastrService.error(res.errorMessage);
          }
        });
      }
    }
  }

  // To add reply to ticket
  addReplyToTicket(replyForm) {

    if (replyForm.status == 'INVALID') {
      this.submitted = true;
      return;
    } else {
      if (replyForm.value && replyForm.value.reply) {
        let url = 'tickets/createReplyTicketsForTicket?ticketId=' + this.ticketId;

        let comments = [];
        let chatDetails = {};

        comments.push({ "message": replyForm.value.reply });

        if (comments && comments.length > 0) {
          chatDetails['comments'] = comments;
        }
        this.appService.loaderStatus('block');
        this.disableSubmitButton = true;
        this.appService.manageHttp('post', url, JSON.stringify(chatDetails)).subscribe((res) => {
          if (res && res.respCode && res.respCode === 205) {
            replyForm.reset();
            this.appService.loaderStatus('none');
            this.getTicketConversationBasedOnId(this.ticketId);
            this.submitted = false;
            this.toastrService.success(res.respMessage);
            this.disableSubmitButton = false;
            this.getAllTickets();
          } else {
            this.appService.loaderStatus('none');
            this.disableSubmitButton = false;
            this.toastrService.error(res.errorMessage);
          }
        });
      }
    }
  }


  // To get all countries
  getAllTickets(event?: any) {
    // To apply pagination and filtering and soting;
    let filterLabels = ["subject", "message", "category", "ticketId", "status"];
    let filterCriteria = this.appService.EventData(event, filterLabels);
    // let filterCriteria = this.appService.arrangefilterData(event, filterLabels, 'updated');
    //let filterCriteria = {};
    if (filterCriteria == 'invalidData') {
      return;
    }
    if (!filterCriteria) {
      return;
    }

    if (!filterCriteria['criteria']) {
      filterCriteria['criteria'] = [];
    }

    filterCriteria['criteria'].push({ "key": "userId", "value": this.loggedInUserId, "type": "in" });
    
    let URL = 'tickets?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, event).subscribe((res) => {
      if (res && res.tickets && res.tickets.length > 0) {
        if (res.pagination && res.pagination.totalRecords) {
          this.totalRecords = res.pagination.totalRecords;
        }
        this.tickets = res.tickets;
        for (var i = 0; i < this.tickets.length; i++) {
          // To show serial number
          if (event && event.first) {
            this.tickets[i].serialNo = (i + 1) + event.first;
          } else {
            this.tickets[i].serialNo = (i + 1);
          }
          this.tickets[i].selectOption = "";
          this.tickets[i].userOptions = [];
          this.tickets[i].userOptions = ['Details'];

          // get status color
          if (this.tickets[i].status) {
            this.tickets[i].statusColor = this.appService.getStatusColor(this.tickets[i].status);
          }

        }
        this.appService.loaderStatus('none');
      }
      else {
        this.tickets = [];
        this.appService.loaderStatus('none');
      }
    });
  }

  // click view more options for actions
  onSelectOptions(value, ticket) {
    this.submitted = false;
    this.replyForm.reset();

    // To apply scroll to modal box
    this.modalHeight = screen.height - 580;

    if (value == 'Add') {
      this.form.reset();
      $('#ticketDetailsAddModal').modal({ backdrop: 'static', keyboard: false }, 'show');
    }
    if (value && ticket && ticket._id) {
      this.ticketDetails = {};
      this.ticketDetails = JSON.parse(JSON.stringify(ticket));

      this.ticketId = ticket._id;
      this.getTicketConversationBasedOnId(this.ticketId);

      if (value === 'Details') {
        $('#ticketDetailsReplyModal').modal('show');
      }
    }
  }

  // get ticket conversation based on ticket id
  getTicketConversationBasedOnId(ticketId) {
    let URL = 'tickets/' + ticketId;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe((res) => {
      if (res && res.respCode && res.respCode === 200) {
        if (res.details) {

          this.ticketDetails = res.details;

          if (this.ticketDetails && this.ticketDetails.createdBy) {
            if (this.ticketDetails.createdBy.buyer) {
              let userDetails = this.ticketDetails.createdBy.buyer;
              // To display user image
              if (userDetails.profilePic) {
                this.ticketDetails.profileImage = userDetails.profilePic;
              }
              // To display user name
              if (userDetails.displayName) {
                this.ticketDetails.userName = userDetails.displayName
              } 
            }
          }

          if (this.ticketDetails.comments && this.ticketDetails.comments.length > 0) {
            this.chatList = this.ticketDetails.comments;
            this.arrangeTicketsDataInOrder(this.chatList);
          } else {
            this.chatList = [];
          }
        }
        this.appService.loaderStatus('none');
      }
      else {
        this.chatList = [];
        this.appService.loaderStatus('none');
      }
    });
  }

  // arrange chat display in proper order
  arrangeTicketsDataInOrder(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].postedBy && data[i].postedBy.buyer) {
        let userDetails = data[i].postedBy.buyer;

        if (data[i].postedBy.buyer.displayName) {
          data[i].userName = data[i].postedBy.buyer.displayName;;
        } else {
          data[i].userName = userDetails.firstName + ' ' + userDetails.lastName;
        }
        data[i].side = 'right';
      }
      if (data[i].postedBy && data[i].postedBy.employee) {
        let userDetails = data[i].postedBy.employee;
        data[i].userName = userDetails.firstName + ' ' + userDetails.lastName + '( Admin )';
        data[i].side = 'left';
      }
    }
    this.chatList = data;
    setTimeout(() => {
      this.showScrollToBottom();
    }, 200);
  }

  // To display scroll to down when user add reply
  showScrollToBottom() {
    let chatContainer = jQuery(".chat-container");
    var scrollToBottom = chatContainer.prop('scrollHeight') + 'px';
    chatContainer.slimScroll({
      scrollTo: scrollToBottom,
      start: 'bottom'
    });
  }
}
