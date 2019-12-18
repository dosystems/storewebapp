import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../app.service";
import { passwordValidator, matchingPasswords } from "../../validators";

@Component({
  selector: 'az-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss'],
  providers: [AppService, ToastrService]
})
export class ChangepasswordComponent implements OnInit {
  form: FormGroup;
  Recoveryform: FormGroup;
  submitted: any = false;
  queryParamMail: any;

  constructor(public router: Router, public activatedroute: ActivatedRoute, private appService: AppService, private toastrService: ToastrService, private fbld: FormBuilder) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    //For Recocery Password 
    this.queryParamMail = this.activatedroute.snapshot.queryParams["enEmail"];
    // For Recocvery Password
    if (this.queryParamMail) {
      this.Recoveryform = this.fbld.group({
        newPassword: ['', Validators.compose([Validators.required, passwordValidator])],
        confirmPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      }, { validator: matchingPasswords('newPassword', 'confirmPassword') });
    }
    //For Change pasword
    this.form = this.fbld.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.compose([Validators.required, passwordValidator])],
      confirmPassword: ['', Validators.compose([Validators.required, passwordValidator])],
    }, { validator: matchingPasswords('newPassword', 'confirmPassword') });
  }

  ngOnInit() {
  }

  // On submit password details 
  onSubmitChangePassword(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    } else {
      if (form.value.currentPassword === form.value.confirmPassword) {
        this.toastrService.error("Current password and new password should not be same");
        return;
      }
      this.appService.manageHttp('post', 'employees/changePassword', form.value)
        .subscribe((res) => {
          if (res && res.errorCode && res.errorCode == this.appService.respCode9001) {
            this.toastrService.error(res.errorMessage);
            return;
          }
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.submitted = false;
            this.toastrService.success(res.respMessage);
            this.router.navigate(['dashboard']);
            this.form.reset();
          } else {
            this.toastrService.error(res.respMessage);
          }
        });
    }
  }
  // For Recovering password For New Employee
  onSubmitRecoverPassword(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    form.value.enEmail = this.queryParamMail;
    this.appService.manageHttp('post', 'employees/changeRecoverPassword', form.value)
      .subscribe((res) => {
        if (res && res.errorCode && res.errorCode == this.appService.respCode9001) {
          this.toastrService.error(res.errorMessage);
          return;
        }
        if (res && res.respCode && res.respCode === this.appService.respCode200) {
          this.submitted = false;
          this.toastrService.success(res.respMessage);
          this.router.navigate(['dashboard']);
          this.form.reset();
        } else {
          this.toastrService.error(res.respMessage);
        }
      });
  }

}