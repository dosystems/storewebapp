import { Component } from '@angular/core';
import { Router ,ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { emailValidator } from '../../validators';
import { AppService } from "../../app.service";

@Component({
  selector: 'az-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AppService, ToastrService]
})
export class LoginComponent {
  form: FormGroup;
  EmployeeDetails:any ={};
  token:any;
  encryptedEmail:any;

  constructor(public router: Router,public activatedroute:ActivatedRoute, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.compose([Validators.required])],
    });
     activatedroute.params.subscribe(p => { this.encryptedEmail = p['encrypted'] });
  }

  onSubmitLogin(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      return;
    } else {
      form.value.entityType = 'employee';
      this.appService.manageHttp('post', 'auth/login', form.value)
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.toastrService.success(res.respMessage);
            localStorage.setItem('employee', JSON.stringify({ employee: res.details }));
            localStorage.setItem('employeeToken', res.accessToken);
            localStorage.setItem('entityType',form.value.entityType );
            this.form.reset();
            this.EmployeeDetails = res.details;
               if(this.EmployeeDetails && this.EmployeeDetails.isFirstTimeLogged === true && this.encryptedEmail ){
                     this.router.navigate(['/changepassword'],{ queryParams : { enEmail:this.encryptedEmail }});
                 } else{
                 this.router.navigate(['/dashboard']);
            }        

          } else {
            this.toastrService.error(res.errorMessage);
          }
        });
    }
  }


}