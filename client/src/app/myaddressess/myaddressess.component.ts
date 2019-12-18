import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../app.service";
import { AppConfig } from '../app.config';
import { Router } from "@angular/router";
@Component({
  selector: 'ross-myaddressess',
  templateUrl: './myaddressess.component.html',
  styleUrls: ['./myaddressess.component.css']
})
export class MyaddressessComponent implements OnInit {
  loggedInUserObjId:any;
  form: FormGroup;
  userDetailsObjId: any;
  submitted: any = false;
  selectedDeliveryAddress: boolean = false;
  disabled: boolean = false;
  countries:any;
  previousAddresses:any=[];
  addressDetails:any={};
  addressId:any;
  constructor(fb: FormBuilder, public router: Router, public appConfig: AppConfig, public appService: AppService, private toastrService: ToastrService, ) {

    this.form = fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      country: [''],
      phone: ['', Validators.required]
    });
   }

  ngOnInit() {
    this.getLoddedInUserId();
    this.getPreviousUserAddresses();

  }


  getLoddedInUserId() {
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user && user.user._id) {
        this.loggedInUserObjId = user.user._id;
      }
    }
  }

  // To get previous user addresses
  getPreviousUserAddresses() {
    let url = 'buyers/'+this.loggedInUserObjId;
    this.previousAddresses = [];
    this.appService.manageHttp('get', url, '')
      .subscribe((res) => {
          if (res.details ) {
            this.userDetailsObjId = this.loggedInUserObjId;
            let userAddresses = res.details.address;
            userAddresses.forEach(address => {
              if (address.active && address.active == true) {
                this.previousAddresses.push(address);
              }
            });
        } else {
          this.previousAddresses = [];
        }
      });
  }

  // On select options in  edit or delete address
  onSelectOptions(address, type?: any) {
    this.addressDetails = {};
    this.addressId = address._id;
    if (type === 'Edit') {
      this.addressDetails = JSON.parse(JSON.stringify(address));
      this.addressDetails.country={ name:this.addressDetails.country };
    } else if (type === 'Delete') {
      this.deleteShipementAddress();
    }
  }

  // To delete shipment address
  deleteShipementAddress() {
    let shipmentAddress: any = {};
    let address: any = {};
    address.operation = 2;
    address._id = this.addressId;
    shipmentAddress.address = address;

    this.appService.manageHttp('put', `buyers/${this.userDetailsObjId}`, shipmentAddress)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode205) {
          this.getPreviousUserAddresses();
          this.toastrService.success(res.respMessage);
        } else {
          this.toastrService.error(res.errorMessage);
        }
      });
  }


   // Adding or updating shipment address
   addOrUpdateShipmentAddress(form?: any) {
    if(this.addressDetails&&this.addressDetails.country&&this.addressDetails.country.name){
      this.addressDetails.country=this.addressDetails.country.name;
      form.value.country=this.addressDetails.country;
    }
    if (form && form.status && form.status === 'INVALID' || !form.value.country) {
      this.submitted = true;
      return
    } else {
      this.selectedDeliveryAddress = true;
      this.submitted = false;
      if (this.addressId) {
        form.value.operation = 1;
        form.value._id = this.addressId;
      } else {
        form.value.operation = 0;
      }
      let obj={address:form.value};
      this.appService.manageHttp('put', `buyers/${this.userDetailsObjId}`, obj)
      .subscribe((res) => {
        if (res && res.respCode && res.respCode === this.appService.respCode205) {
          this.getPreviousUserAddresses();
          this.addressId='';
          this.form.reset();
          this.toastrService.success(res.respMessage);
        } else {
          this.toastrService.error(res.errorMessage);
        }
      });
      // this.changeDeliverAddress(form.value);
    }
  }


    // to get all Countries
    getAllCountries(event: any) {
      if (event && event.query) {
        var URL = 'countries?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
        this.appService.manageHttp('get', URL, '').subscribe((res) => {
          if (res) {
            this.countries = res.countrys;
          } else {
            this.countries = [];
          }
        });
      }
    }

}
