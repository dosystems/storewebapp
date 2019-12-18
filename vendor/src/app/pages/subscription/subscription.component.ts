import { Component, OnInit } from '@angular/core';
import { AppService } from "../../app.service";
declare var $: any;

@Component({
  selector: 'az-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  plans: any = [];
  disableSubmitButton: boolean = false;
  planInfo: any = {};

  constructor(public appService: AppService) { }

  ngOnInit() {
    this.getAllPlans();
  }

  // get plans
  getAllPlans() {
    this.appService.loaderStatus('block');   
    this.appService.manageHttp('get', 'plans?filter={"sortfield":"duration","direction":"asc"}', '').subscribe((res) => {
      if (res && res.plans && res.plans.length && res.plans.length > 0) {
        this.plans = res.plans;
        this.appService.loaderStatus('none');
      } else {
        this.plans = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
      this.appService.loaderStatus('none');
    });
  }

  // To open package upgrade modal
  askUserToUpgradePakage(plan?: any) {
    this.disableSubmitButton = false;
    this.planInfo = plan;
    $('#showPackageUpgradeModel').modal({ backdrop: 'static', keyboard: false }, 'show');
  }

  // user package upgrade
  upgradeUserPackage() {
    if (this.planInfo && this.planInfo._id) {
      this.appService.loaderStatus('block');
      this.disableSubmitButton = true;

      let subscription: any = {};
      subscription.planId = this.planInfo._id;
      subscription.amountPaid = this.planInfo.price;

      this.appService.manageHttp('post', 'subscriptions', subscription)
        .subscribe((res) => {
          this.appService.loaderStatus('none');
          if (res && res.respCode && res.respCode === this.appService.respCode204) {
            $('#showPackageUpgradeModel').modal('hide');
            this.appService.displayToasterMessage(res.respMessage);
            this.appService.loaderStatus('none');
            this.disableSubmitButton = false;
            // this.getAllPlans();
          } else {
            this.disableSubmitButton = false;
            this.appService.displayToasterMessage(res.errorMessage, 'error');
          }
        });
    } else {
      return
    }
  }

}
