import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from "../../app.config";
import { DashboardService } from './dashboard.service';
import { AppService } from "../../app.service";
import * as moment from 'moment/moment';
declare var $: any;

@Component({
    selector: 'az-dashboard',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [DashboardService]
})
export class DashboardComponent {
    public config: any;
    public configFn: any;
    public bgColor: any;
    public date = new Date();
    public weatherData: any;
    public commanChartOptions: any;
    public commonChartColor: any;
    public commanChartData: any;
    public commanChartLabels: any;
    public latestOrders: any;
    public dashBoardDetails: any;
    public monthaArray: any;
    public topSellers: any = [];

    public sellerBuyerLabels: any = [];
    public sellerBuyerData: any = [];
    public orderDayWiseLabels:any = [];
    buyers: any = [];
    sellers: any = [];
    latestReviews:any = [];
    latestBuyers:any = [];
    latestSellers:any = [];
    CancelOrders:any =[];
    pendingOrders:any =[];
    Month = [  
        {"val":1,"month":"January"},{"val":2,"month":"February"},{"val":3,"month":"March"},{"val":4,"month":"April"},
        {"val":5,"month":"May"},{"val":6,"month":"June"},{"val":7,"month":"July"},{"val":8,"month":"August"},
        {"val":9,"month":"September"},{"val":10,"month":"October"},{"val":11,"month":"November"},{"val":12,"month":"December"}
    ];
    reviewData:any = {}; 
    public ordersLineChartData: any = [];
    public ordersLineChartLabels: any = [];
 

    constructor(private _appConfig: AppConfig, private _dashboardService: DashboardService, public appService: AppService) {
        this.config = this._appConfig.config;
      //  let date = new Date().getMonth();
       // this.monthaArray = this._appConfig.months.slice(date - 3, date + 1);
        this.configFn = this._appConfig;
        this.weatherData = _dashboardService.getWeatherData();
      //  this.sellerBuyerLabels = this._appConfig.monthNames.slice(date - 3, date + 1);
        this.getDashboardDetails();
        this.getOrderDetails();
        this.getChartOptions();
        this.getChartColors();
        this.getChartData();
        this.getLatestReviews();
        this.getLatestBuyers();
        this.getLatestSellers();
        this.getCancelOrders();
        this.getPendingOrders();
        this.getBestSelelrs();

    }


   // For view modal box of Reviews
  viewModal(data){
    if(data){
      this.reviewData = JSON.parse(JSON.stringify(data));
      $('#openReviewDetailsModal').modal({ backdrop: 'static', keyboard: false },'show');
    }
  }


    // function to get the chart options
    getChartOptions() {
        this.commanChartOptions = {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: this.configFn.rgba(this.config.colors.gray, 0.7),
                        fontSize: 14,
                        beginAtZero: true
                    },
                    gridLines: {
                        display: true,
                        zeroLineColor: this.configFn.rgba(this.config.colors.gray, 0.4),
                        zeroLineWidth: 1,
                        color: this.configFn.rgba(this.config.colors.gray, 0.1)
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: this.configFn.rgba(this.config.colors.gray, 0.7)
                    },
                    gridLines: {
                        display: true,
                        zeroLineColor: this.configFn.rgba(this.config.colors.gray, 0.4),
                        zeroLineWidth: 1,
                        color: this.configFn.rgba(this.config.colors.gray, 0.1)
                    }
                }]
            },
            legend: {
                labels: {
                    fontColor: this.configFn.rgba(this.config.colors.gray, 0.9),
                }
            },
            tooltips: {
                enabled: true,
                backgroundColor: this.configFn.rgba(this.config.colors.main, 0.6)
            }
        }
    }

    // function to get the chart colors
    getChartColors() {
        this.commonChartColor = [
            {
                borderWidth: 2,
                backgroundColor: this.configFn.rgba(this.config.colors.info, 0.5),
                borderColor: this.config.colors.info,
                pointBorderColor: this.config.colors.default,
                pointHoverBorderColor: this.config.colors.info,
                pointHoverBackgroundColor: this.config.colors.default,
                hoverBackgroundColor: this.config.colors.info
            },
            {
                borderWidth: 2,
                backgroundColor: this.configFn.rgba(this.config.colors.danger, 0.5),
                borderColor: this.config.colors.danger,
                pointBorderColor: this.config.colors.default,
                pointHoverBorderColor: this.config.colors.danger,
                pointHoverBackgroundColor: this.config.colors.default,
                hoverBackgroundColor: this.config.colors.danger
            },

        ];
    }
    getChartData() {
        this.commanChartData = [
            { data: [11700, 10320, 25080, 32501], label: 'Orders' }]

        this.commanChartLabels = ['week1', 'week2', 'week3', 'week4'];
    }

    //Function to get the latest orders
    getOrderDetails() {
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc","criteria": [{ "key": "status", "value": ['Paid','Processing','Shipped','Delivered'], "type": "in" }] };
        let url = 'orders?filter=' + JSON.stringify(filterCriteria);
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.orders && res.orders.length && res.orders.length > 0) {
                this.latestOrders = res.orders;
                for (let i = 0; i < this.latestOrders.length; i++) {
                    this.latestOrders[i].sno = i + 1;
                    if (this.latestOrders[i].created) {
                        this.latestOrders[i].created = moment(this.latestOrders[i].created).format(this.configFn.userFormat);
                    }
                }
            } else {
                this.latestOrders = [];
            }
        })
    }
    //Get Call for total reviews  Reviews
     getLatestReviews(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
         let URL = 'reviews?filter=' + JSON.stringify(filterCriteria)
         this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.reviews && res.reviews.length && res.reviews.length > 0){
                 this.latestReviews = res.reviews;
                 for (let i = 0; i < this.latestReviews.length; i++) {
                    this.latestReviews[i].sno = i + 1;
                    if (this.latestReviews[i].created) {
                        this.latestReviews[i].created = moment(this.latestReviews[i].created).format(this.configFn.userFormat);
                    }
                }                
             } else{
                 this.latestReviews = [];
             }
         });
     }

    // Get Call For latest Buyers
     getLatestBuyers(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
         let URL = 'buyers?filter=' + JSON.stringify(filterCriteria)
         this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.buyers && res.buyers.length && res.buyers.length > 0){
                 this.latestBuyers = res.buyers;
                 for (let i = 0; i < this.latestBuyers.length; i++) {
                    this.latestBuyers[i].sno = i + 1;
                    if (this.latestBuyers[i].created) {
                        this.latestBuyers[i].created = moment(this.latestBuyers[i].created).format(this.configFn.userFormat);
                    }
                }                
             } else{
                 this.latestBuyers = [];
             }
         });
     }    
     
     //Get Call For Latest Sellers
     getLatestSellers(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
         let URL = 'sellers?filter=' + JSON.stringify(filterCriteria)
         this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.sellers && res.sellers.length && res.sellers.length > 0){
                 this.latestSellers = res.sellers;
                 for (let i = 0; i < this.latestSellers.length; i++) {
                    this.latestSellers[i].sno = i + 1;
                    if (this.latestSellers[i].created) {
                        this.latestSellers[i].created = moment(this.latestSellers[i].created).format(this.configFn.userFormat);
                    }
                }                
             } else{
                 this.latestSellers = [];
             }
         });
     }
     
     //Get Call For Cancelled Orders
     getCancelOrders(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc","criteria": [{ "key": "status", "value": "Cancelled", "type": "eq" }] };
         let URL = 'orders?filter=' + JSON.stringify(filterCriteria)
         this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.orders && res.orders.length && res.orders.length > 0){
                 this.CancelOrders = res.orders;
                 for (let i = 0; i < this.CancelOrders.length; i++) {
                    this.CancelOrders[i].sno = i + 1;
                    if (this.CancelOrders[i].created) {
                        this.CancelOrders[i].created = moment(this.CancelOrders[i].created).format(this.configFn.userFormat);
                    }
                }                
             } else{
                 this.CancelOrders = [];
             }
         });         
     }

     //Get Call For Pending Orders
     getPendingOrders(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc","criteria": [{ "key": "status", "value": ['Paid','Processing','Shipped'], "type": "eq" }] };
         let URL = 'orders?filter=' + JSON.stringify(filterCriteria);
         this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.orders && res.orders.length && res.orders.length > 0){
                 this.pendingOrders = res.orders;
                 for (let i = 0; i < this.pendingOrders.length; i++) {
                    this.pendingOrders[i].sno = i + 1;
                    if (this.pendingOrders[i].created) {
                        this.pendingOrders[i].created = moment(this.pendingOrders[i].created).format(this.configFn.userFormat);
                    }
                }                
             } else{
                 this.pendingOrders = [];
             }
         });         
     }     

    //For Getting Best Sellers
     getBestSelelrs(){
         let filterCriteria = { "limit": 5, "sortfield": "totalAmount", "direction": "desc" };
         let  URL = 'reports/bestSeller' + '?filter=' + JSON.stringify(filterCriteria);
          this.appService.manageHttp('get',URL,'').subscribe( res =>{
             if(res && res.bestSeller && res.bestSeller.length && res.bestSeller.length > 0){
                 this.topSellers = res.bestSeller;
                 for (let i = 0; i < this.topSellers.length; i++) {
                    this.topSellers[i].sno = i + 1;
                }                
             } else{
                 this.latestBuyers = [];
             }
         });        
     }


    //function to get the dashboard details
    getDashboardDetails() {
        this.appService.loaderStatus('block');
        this.appService.manageHttp('get', 'employees/dashBoard', '').subscribe(res => {
            if (res) {
                var dataArray = []
                this.dashBoardDetails = res;
                // to get the data for month orders chart
                if (this.dashBoardDetails && this.dashBoardDetails.orderChartCounts && this.dashBoardDetails.orderChartCounts.length) {
                      dataArray = this.dashBoardDetails.orderChartCounts.map(x => { return x.count });
                     this.ordersLineChartData = [{ data: dataArray, label: 'Orders' }];
                }
                

                //to get the data for last four months buyers and sellers count
                if (this.dashBoardDetails.buyerChartCounts) {
                    for(var i=0;i<this.dashBoardDetails.buyerChartCounts.length;i++){
                        for(var j=0;j<this.Month.length;j++){
                            if(this.dashBoardDetails.buyerChartCounts[i].month === this.Month[j].val){
                                this.sellerBuyerLabels.push(this.Month[j].month);
                                this.buyers.push(this.dashBoardDetails.buyerChartCounts[i].count);
                            }
                        }
                    }
                } else {
                    this.buyers = [0, 0, 0, 0]
                }
                  //For seller Chart Count
                if (this.dashBoardDetails.sellerChartCounts) {
                    for(var i=0;i<this.dashBoardDetails.sellerChartCounts.length;i++){
                        for(var j=0;j<this.Month.length;j++){
                            if(this.dashBoardDetails.sellerChartCounts[i].month === this.Month[j].val){
                                this.sellers.push(this.dashBoardDetails.sellerChartCounts[i].count);
                            }
                        }
                    }    
                } else {
                    this.sellers = [0, 0, 0, 0]
                }
                this.sellerBuyerData = [{ data: this.sellers, label: 'Merchants' }, { data: this.buyers, label: "Customers" }];
              this.appService.loaderStatus('none');
            }
        });
    }

}


