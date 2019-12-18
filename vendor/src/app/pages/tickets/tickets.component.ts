import { Component } from '@angular/core';
import { AppConfig } from "../../app.config";
import { AppService } from "../../app.service";
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'az-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent {
  tickets: any = [];
  totalRecords: any;
  ticketDetails: any = {};
  form: any;
  replyForm: any;
  submitted: any = false;
  ticketId: any;
  public chatList: Array<any>;
  public reply: string = '';
  categoryList: any;
  modalHeight: any;
  categoryTypes: any = [];
  ticketInfo:any = {};

  constructor( private fbld: FormBuilder, public route: Router, public appService: AppService, public router: Router, private toastrService: ToastrService, activatedroute: ActivatedRoute, public _appConfig: AppConfig) {
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
      ticketId: [''],
      status: ['']
    });
    this.replyForm = this.fbld.group({
      reply: ['', Validators.required]
    });

  }

  // To get all tickets
  getAllTickets(event?: any) {
     // To apply pagination and filtering and soting
     let filterLabels = ["subject", "message", "category", "ticketId", "userName","userId"];
     let type='tickets';
     let filterCriteria = this.appService.EventData(event, filterLabels,type);
 
     if (!filterCriteria) {
         return;
     }
     
    let URL = 'tickets?filter=' + JSON.stringify(filterCriteria) + '';
    this.appService.manageHttp('get', URL, event).subscribe((res) => {
      if (res) {
        if (res.pagination && res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
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
          this.tickets[i].userOptions = ['Details', 'Delete'];

          // get status color
          if(this.tickets[i].status){
            this.tickets[i].statusColor = this.appService.getStatusColor(this.tickets[i].status);
          }         
        }
      }
      else {
        this.tickets = [];
      }
    });
  }

  // click view more options for actions
  onSelectOptions(value, ticket) {
    this.submitted = false;
    this.replyForm.reset();

    // To apply scroll to modal box
    this.modalHeight = screen.height - 480;

    if (value && ticket && ticket._id) {
      this.ticketDetails = {};
      this.ticketDetails = JSON.parse(JSON.stringify(ticket));

      this.ticketId = ticket._id;
      this.getTicketConversationBasedOnId(this.ticketId);

      if (value === 'Details') {
        $('#ticketDetailsReplyModal').modal('show');
      } else if (value === 'Delete') {
        $('#ticketDetailsDeleteModal').modal({ backdrop: 'static', keyboard: false }, 'show');
      }

      // To show select as default option in actions
      for (var index = 0; index < this.tickets.length; index++) {
        if (ticket._id === this.tickets[index]._id) {
          if (this.tickets[index].selectOption) {
            setTimeout(() => {
              this.tickets[index].selectOption = "";
            }, 200);
          }
          return;
        }
      }

    }
  }

  // To delete ticket based on id
  deleteTicket(ticketId: any) {
    this.appService.loaderStatus('block');
    this.appService.manageHttp('delete', 'tickets/' + ticketId, null)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode206) {
          this.toastrService.success(res.respMessage);
          $('#ticketDetailsDeleteModal').modal('hide');
          this.appService.loaderStatus('none');
          this.getAllTickets(event);
        } else {
          this.toastrService.error(res.errorMessage);
          this.appService.loaderStatus('none');
        }
      });
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
        this.appService.manageHttp('post', url, chatDetails).subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode205) {
            this.submitted = false;
            replyForm.reset();
            this.getTicketConversationBasedOnId(this.ticketId);
            this.toastrService.success(res.respMessage);
            this.appService.loaderStatus('none');
            this.getAllTickets(event);
          } else {
            this.toastrService.error(res.errorMessage);
            this.appService.loaderStatus('none');
          }
        });
      }
    }
  }
  // get ticket conversation based on ticket id
  getTicketConversationBasedOnId(ticketId) {
    let URL = 'tickets/' + ticketId;
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe((res) => {
      if (res && res.respCode && res.respCode === this.appService.respCode200) {
        if (res.details) {

          this.ticketDetails = res.details;
          if (this.ticketDetails && this.ticketDetails.createdBy) {
            if (this.ticketDetails.createdBy.user) {
              let userDetails = this.ticketDetails.createdBy.user;
              // To display user image
              if(userDetails.profileImage){
                this.ticketDetails.profileImage = userDetails.profileImage;
              } 
              // To display user name
              if (userDetails.userName && userDetails.userId) {
                this.ticketDetails.userName = userDetails.userName + ' ( ' + userDetails.userId + ' )';
              } else {
                this.ticketDetails.userName = userDetails.firstname + ' ' + userDetails.lastname;
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
      if (data[i].postedBy && data[i].postedBy.user) {
        let userDetails = data[i].postedBy.user;

        if (userDetails.userName && userDetails.userId) {
          data[i].userName = userDetails.userName + ' ( ' + userDetails.userId + ' )';
        } else {
          data[i].userName = userDetails.firstname + ' ' + userDetails.lastname;
        }
        data[i].side = 'left';
      }
      if (data[i].postedBy && data[i].postedBy.employee) {
        let userDetails = data[i].postedBy.employee;
        data[i].userName = userDetails.firstName + ' ' + userDetails.lastName + '( Admin )';
        data[i].side = 'right';
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

  // To update status of ticket based on ticket id
  updateTicketStatus(ticketStatus) {
    
    // Assign status when checked status
    if(ticketStatus == true){
      this.ticketInfo.status = 'Closed';
    } else {
      this.ticketInfo.status = '';
    }

    this.appService.loaderStatus('block');
    this.appService.manageHttp('put', 'tickets/' + this.ticketId, this.ticketInfo)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode205) {
          this.toastrService.success(res.respMessage);
          this.appService.loaderStatus('none');
          this.getAllTickets(event);
        } else {
          this.toastrService.error(res.errorMessage);
          this.appService.loaderStatus('none');
        }
      });
  }

}
