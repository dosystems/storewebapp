import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { emailValidator } from '../validators';
import { AppService } from "../app.service";
import { NavbarService } from '../navbar.service';
@Component({
  selector: 'ross-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form:FormGroup;
  showLogin:boolean=true;
  email:any;
  password:any;
  disabled:any;
  constructor( public NavbarService:NavbarService, public router: Router, fb: FormBuilder, private toastrService: ToastrService, public appService: AppService) {
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.compose([Validators.required])],
      entityType:[]
    });
  }

// to login 
  onSubmitLogin(form?: any) {
    if (form && form.status && form.status === 'INVALID') {
      return;
    } else {
      this.disabled=true;
      form.value.entityType = 'buyer';
      this.appService.manageHttp('post', 'auth/login', form.value)
        .subscribe((res) => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
            this.toastrService.success(res.respMessage);
            localStorage.setItem('user', JSON.stringify({ user: res.details }));
            localStorage.setItem('userToken', res.accessToken);
            this.form.reset();
            this.disabled=false;
            this.NavbarService.callComponentMethod();
            this.createOrdersSavedInLocalStorage();
            this.router.navigate([this.router.url]);
            
          } else {
            this.disabled=false;
            this.toastrService.error(res.errorMessage);
          }
        });
    }
  }



  // to get orders from local storage and create orders saved in local storage
  createOrdersSavedInLocalStorage(){
    if(localStorage.getItem('orders')){
      let orders = JSON.parse(localStorage.getItem('orders'));
      if (orders&&orders.length>0) {
        orders.forEach(order => {
          // create order
          this.createOrder(order);
        });
      }
      localStorage.removeItem('orders');
    }
    this.NavbarService.callComponentMethod2();
  }

  // create order
  createOrder(order){
    if(order&&order.inventory){
      delete order.inventory.Available;
      delete order.inventory.Quantity;
      delete order.inventory.Hold;
    }
    
    this.appService.manageHttp('post', 'orders', order).subscribe(res => {
          if (res && res.respCode && res.respCode === this.appService.respCode200) {
          }
        }, (error) => {
          this.toastrService.error('Something Went Wrong');
          this.appService.loaderStatus('none');
        });
  }
}
