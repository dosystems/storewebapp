import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  submitted: any = false;

  constructor(private appService: AppService, private toastrService: ToastrService, private fbld: FormBuilder,
              public router:Router) {
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
      this.appService.manageHttp('post', 'sellers/changePassword', form.value)
        .subscribe((res) => {
          if (res && res.errorCode && res.errorCode == this.appService.respCode9001) {
            this.toastrService.error(res.errorMessage);
            return;
          }
          if (res && res.respCode && res.respMessage) {
            this.submitted = false;
            this.toastrService.success(res.respMessage);
            this.form.reset();
            this.router.navigate(['/dashboard']);
          } else {
            this.toastrService.error(res.respMessage);
          }
        });
    }
  }
}