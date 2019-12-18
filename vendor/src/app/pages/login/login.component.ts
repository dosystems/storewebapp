import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(public router: Router, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) {
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.compose([Validators.required])],
    });
    let routeUrl = router.url.split('/');
    if (routeUrl && routeUrl.length && routeUrl.length > 0 && routeUrl[1] && routeUrl[1] == 'activateEmail') {
      if (routeUrl[1]) {
        this.activateVendor(routeUrl[2]);
      }
    }
  }

  onSubmitLogin(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      return;
    } else {
      form.value.entityType = 'seller';
      this.appService.manageHttp('post', 'auth/login', form.value)
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.toastrService.success(res.respMessage);
            this.router.navigate(['/dashboard']);
            localStorage.setItem('vendor', JSON.stringify({ vendor: res.details }));
            localStorage.setItem('vendorToken', res.accessToken);
            localStorage.setItem('entityType', form.value.entityType);
            this.form.reset();
          } else {
            this.toastrService.error(res.errorMessage);
          }
        });
    }
  }
  activateVendor(id) {
    let vendorData: any = {};
    this.appService.manageHttp('put', 'sellers/activate/'+id+'?type=accountActivation', vendorData).subscribe(res => {
      if (res && res.respMessage) {
        this.toastrService.success(res.respMessage);
        this.router.navigate(['/login']);
      } else if (res && res.errorMessage) {
        this.toastrService.error(res.errorMessage);
      }
    }, (error) => {
      this.toastrService.error('something went wrong');
    });
  }
}