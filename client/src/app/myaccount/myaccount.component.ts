import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../app.service";
import { AppConfig } from '../app.config';
import { Router } from "@angular/router";
@Component({
  selector: 'ross-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {
  loggedInUserObjId: any;
  userDetails: any = {};
  showAccount: any = false;
  address: any = false;
  wishlist: boolean = false;
  orders: boolean = false;
  form: FormGroup;
  submitted: any;
  showEdit: any = false;
  checked: any = true;
  constructor(fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService, private toastrService: ToastrService) {
    if (this.router.url == '/myAccount') {
      this.showAccount = true;
    } else if (this.router.url == '/myaddresses') {
      this.address = true;
    } else if (this.router.url == '/myWishList') {
      this.wishlist = true;
    } else if (this.router.url == '/myorders') {
      this.orders = true;
    }


    this.form = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: [''],
      language:['',Validators.required]
    });
  }


  ngOnInit() {
    this.getLoggedInUserId();
    this.getUserDetails();

  }


  getLoggedInUserId() {
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user && user.user._id) {
        this.loggedInUserObjId = user.user._id;
      }
    }
  }


  // To get previous user addresses
  getUserDetails() {
    let url = 'buyers/' + this.loggedInUserObjId;
    this.appService.manageHttp('get', url, '')
      .subscribe((res) => {
        if (res.details) {
          this.userDetails = res.details;
        } else {
          this.userDetails = {};
        }
      });
  }


  // Adding or updating shipment address
  updateDetails(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      form.value.isSubscribed = this.userDetails.isSubscribed;
      this.appService.manageHttp('put', `buyers/${this.loggedInUserObjId}`, form.value)
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode205) {
            this.getUserDetails();
            this.form.reset();
            this.showEdit = false;
            this.toastrService.success(res.respMessage);
          } else {
            this.toastrService.error(res.errorMessage);
          }
        });
    }
  }
}
