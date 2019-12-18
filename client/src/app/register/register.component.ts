import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { emailValidator, passwordValidator, matchingPasswords } from '../validators';
import { AppService } from "../app.service";


@Component({
  selector: 'ross-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  changePasswordForm: FormGroup;
  forgotPasswordform: FormGroup;
  resetPasswordForm: FormGroup;
  submitted: boolean;
  showcreateForm: boolean = false;
  forgotPassword: boolean = false;
  changePassword: boolean = false;
  showResetPassword: boolean = false;
  urlParams: any;
  enEmail:any;
  constructor(public router: Router, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) {
    this.form = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.compose([Validators.required, passwordValidator])]
    });

    this.forgotPasswordform = fb.group({
      email: ['', Validators.compose([Validators.required, emailValidator])],
    });


    this.changePasswordForm = fb.group({
      currentPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      newPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      confirmPassword: ['', Validators.compose([Validators.required, passwordValidator])]
    },
      { validator: matchingPasswords('newPassword', 'confirmPassword') });


    this.resetPasswordForm = fb.group({
      newPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      confirmPassword: ['', Validators.compose([Validators.required, passwordValidator])]
    },
      { validator: matchingPasswords('newPassword', 'confirmPassword') });




    this.urlParams = window.location.pathname.split('/');
    let key = this.urlParams[this.urlParams.length - 1];
    let keyType = this.urlParams[this.urlParams.length - 2];
    if (this.router.url == "/create") {
      this.showcreateForm = true;
    } else if (this.router.url == "/changePassword") {
      this.changePassword = true;
    } else if (this.router.url == "/forgotPassword") {
      this.forgotPassword = true;
    } else {
      if (key) {
        if (keyType == 'activateEmail') {
          this.activateUser(key);
        } else if (keyType == 'resetPassword') {
          this.enEmail=key;
          this.showResetPassword = true;
        }
      }

    }
  }




  //  to create new account of a customer
  createAccountOrChangePassword(form: any, type?: any) {
    let method;
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    } else {
      if (type == 'account') {
        for (var details in form.value) {
          if(form.value[details]=='firstName'||form.value[details]=='lastName'){
            form.value[details] = this.appService.capitalize(form.value[details]);
          }
        }
        method = this.appService.manageHttp('post', 'buyers/signUp', form.value)
      } else if (type == 'changePassword') {
        method = this.appService.manageHttp('post', 'buyers/changePassword', form.value)
      } else if (type == 'forgotPassword') {
        if (form.value.email)
          method = this.appService.manageHttp('post', 'buyers/forgotPassword?displayName=' + form.value.email, '')
      }


      method.subscribe((res) => {
        if (res && res.respCode && (res.respCode === this.appService.respCode204 || this.appService.respCode200)) {
          this.toastrService.success(res.respMessage);
          this.router.navigate(['/']);
          this.form.reset();
          this.changePasswordForm.reset();
        } else {
          this.toastrService.error(res.errorMessage);
        }
      });
    }
  }

  activateUser(userId) {
    var data: any = {};
    data.status = "Active";
    this.appService.manageHttp('put', 'buyers/' + userId, data)
      .subscribe((res) => {
        if (res && res.respCode && (res.respCode === this.appService.respCode204 || this.appService.respCode200)) {
          this.toastrService.success(res.respMessage);
          this.router.navigate(['/']);
          this.form.reset();
          this.changePasswordForm.reset();
        } else {
          this.toastrService.error(res.errorMessage);
        }
      });

  }



  // reset password
  resetPassword(form) {
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    } else {
      form.value.enEmail=this.enEmail;
      this.appService.manageHttp('post', 'buyers/changeRecoverPassword', form.value)
        .subscribe((res) => {
          if (res && res.respCode && (res.respCode === this.appService.respCode204 || this.appService.respCode200)) {
            localStorage.setItem('user', JSON.stringify({ user: res.details }));
            localStorage.setItem('userToken', res.accessToken);
            this.toastrService.success(res.respMessage);
            this.router.navigate(['/']);
            this.form.reset();
            this.resetPasswordForm.reset();
          } else {
            this.toastrService.error(res.errorMessage);
          }
        });
    }

  }






}
