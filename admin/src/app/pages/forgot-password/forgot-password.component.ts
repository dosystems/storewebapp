import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../app.service";
import { emailValidator,passwordValidator,matchingPasswords } from "../../validators";

@Component({
  selector: 'az-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [AppService, ToastrService]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  pageName:any;
  resetForm:FormGroup;
  submitted:boolean;
  enEmail:any;

  constructor(fb: FormBuilder,private toastrService: ToastrService, public appService: AppService ,public router:Router) {
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, emailValidator])]
    });
     this.resetForm = fb.group({
      newPassword:['',Validators.compose([Validators.required, passwordValidator])],
      confirmPassword:['',Validators.required]
    }, { validator: matchingPasswords('newPassword', 'confirmPassword') })
    let routeUrls = router.url.split('/');
    if(routeUrls[1] == 'forgotpassword'){
      this.pageName = 'forgotPassword';
    }else if(routeUrls[1] == 'resetPassword') {
      this.pageName = 'resetPassword';
      this.enEmail = routeUrls[2];
    }
  }
  // on click submit forgot password button send email
  onSubmitForgotPassword(form?: any) {
    if (form && form.status && form.statuS === 'INVALID') {
      return
    } else {
      this.appService.manageHttp('post', 'employees/forgotPassword?employeeName=' + form.value.email, '')
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.toastrService.success(res.respMessage);
            this.form.reset();
          } else {
            this.toastrService.error(res.errorMessage);
          }
        });
    }
  }

   //Reset Password
  resetPassword(){
    if(this.resetForm && this.resetForm.status && this.resetForm.status == 'VALID'){
      this.resetForm.value.enEmail = this.enEmail;
      this.appService.manageHttp('post','employees/changeRecoverPassword',this.resetForm.value).subscribe(res =>{
        if(res && res.respMessage){
          this.toastrService.success(res.respMessage);
          this.router.navigate(['/login']);
        }else if(res && res.errorMessage){
          this.toastrService.error(res.errorMessage);
        }
      })
    }else{
      this.submitted = true;
    }
  }  
}

