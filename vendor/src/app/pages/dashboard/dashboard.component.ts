import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from "../../app.config";
import { DashboardService } from './dashboard.service';
import { AppService } from "../../app.service";
import { Router } from '@angular/router';
import * as moment from 'moment/moment';

@Component({
    selector: 'az-dashboard',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
    public config: any;
    public configFn: any;
    public bgColor: any;
    public date = new Date();
    public weatherData: any;
    public commanChartOptions: any;
    public commonChartColor: any;
    public commanChartData: any;
    public commanChartData2: any;
    public commanChartLabels: any;
    public latestOrders: any;
    public dashBoardDetails: any;
    public monthaArray: any;
    public topSellers: any = [];

    public sellerBuyerLabels: any = [];
    public sellerBuyerData: any = [];
    buyers: any = [];
    sellers: any = [];
    ordersCount: any = [];

    public ordersLineChartData: any = [];
    public ordersLineChartLabels: any = [];
    public CustomerChartData: any = [];
    lowStockProducts: any;
    neverPurchasedProducts: any;
    shippingOrders: any = [];
    latestReviews: any = [];
    loginVendorid: any;

    public pieChartType: string = 'doughnut';
    public totalOrdersSummayLabels: Array<string>;
    public totalOrdersSummayData: Array<number>;
    public pieChartColors: any[];
    public pieChartOptions: any;
    public Month: any = [
        { "val": 1, "month": "January" }, { "val": 2, "month": "February" }, { "val": 3, "month": "March" }, { "val": 4, "month": "April" },
        { "val": 5, "month": "May" }, { "val": 6, "month": "June" }, { "val": 7, "month": "July" }, { "val": 8, "month": "August" },
        { "val": 9, "month": "September" }, { "val": 10, "month": "October" }, { "val": 11, "month": "November" }, { "val": 12, "month": "December" }
    ];
    CancelOrders:any = [];



    constructor(private _appConfig: AppConfig, private _dashboardService: DashboardService, public appService: AppService, public router: Router) {
        this.appService.getLocalStorageData();
        this.config = this._appConfig.config;
        let date = new Date().getMonth();
        this.monthaArray = this._appConfig.months.slice(date - 3, date + 1);
        this.configFn = this._appConfig;
        this.weatherData = _dashboardService.getWeatherData();
        // this.sellerBuyerLabels = this._appConfig.monthNames.slice(date - 3, date + 1);
        this.getLocalStorageData();
        this.getDashboardDetails();
        this.getVendorLatestOrderDetails();
        this.getVendorLatestOrderDetails('Shipped');
        this.getLatestReviews();
        this.getChartOptions();
        this.getChartColors();
        this.getChartData();


        this.getProductsNeverPurchased();
        this.getLowStockProducts();
        this.getCancelledOrders();
    }

    ngOnInit() {
        this.totalOrdersSummayLabels = [];
        this.totalOrdersSummayData = [];
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
        },
            this.pieChartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    labels: {
                        fontColor: this.configFn.rgba(this.config.colors.gray, 0.9),
                    },
                    position:'right'
                },
                tooltips: {
                    enabled: true,
                    backgroundColor: this.configFn.rgba(this.config.colors.main, 0.7)
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
        this.pieChartColors = [
            {
                backgroundColor: [
                    this.configFn.rgba(this.config.colors.success, 0.7),
                    this.configFn.rgba(this.config.colors.dark, 0.7),
                    this.configFn.rgba(this.config.colors.danger, 0.7),
                    this.configFn.rgba(this.config.colors.default, 0.7),
                    this.configFn.rgba(this.config.colors.primary, 0.7),
                    this.configFn.rgba(this.config.colors.gray, 0.7),
                    this.configFn.rgba(this.config.colors.info, 0.7),
                    this.configFn.rgba(this.config.colors.warning, 0.7),
                ],
                hoverBackgroundColor: [
                    this.config.colors.success,
                    this.config.colors.dark,
                    this.config.colors.danger,
                    this.config.colors.default,
                    this.config.colors.primary,
                    this.config.colors.gray,
                    this.config.colors.info,
                    this.config.colors.warning
                ],
                borderColor: this.config.colors.grayLight,
                borderWidth: 1,
                hoverBorderWidth: 3
            }
        ];
    }
    getChartData() {
        this.commanChartData = [
            { data: [11700, 10320, 25080, 32501], label: 'Orders' }]
        this.commanChartData2 = [
            { data: [11700, 10320, 25080, 32501], label: 'Customers' }]

        this.commanChartLabels = ['week1', 'week2', 'week3', 'week4'];
    }

    //Function to get the latest orders
    getVendorLatestOrderDetails(type?: any) {
        let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
        filterCriteria['criteria'] = [];
        filterCriteria['criteria'].push({
            "key": "ownerId",
            "value": this.appService.loginVendorDetails._id,
            "type": "eq"
        },{
            "key": "status",
            "value": [ 'Paid','Delivered','Processing','Shipped','Cancelled','Returned' ],
            "type": "eq"
        });

        if (type && type === 'Shipped') {
            filterCriteria['criteria'].push({
                "key": "status",
                "value": ['Shipped', 'Delivered'],
                "type": "in"
            });
        }

        let url = 'orders?filter=' + JSON.stringify(filterCriteria)
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.orders && res.orders.length && res.orders.length > 0) {
                if (type && type === 'Shipped') {
                    this.shippingOrders = res.orders;
                    this.shippingOrders.forEach((order, index) => {
                        order.sno = index + 1;
                    });
                } else {
                    this.latestOrders = res.orders;
                    this.latestOrders.forEach((order, index) => {
                        order.sno = index + 1;
                    });
                }

            } else {
                if (type && type === 'Shipped') {
                    this.shippingOrders = [];
                } else {
                    this.latestOrders = [];
                }

            }
        })
    }

    //get Cancelled Orders of vendor
    getCancelledOrders(){
         let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc",
         "criteria": [{ "key": "ownerId", "value": this.appService.loginVendorDetails._id, "type": "eq" },
                       { "key": "status", "value": "Cancelled", "type": "eq"     } ] };
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
    //function to get the dashboard details
    getDashboardDetails() {
        //this.appService.loaderStatus('block');
        this.appService.manageHttp('get', 'sellers/dashboard', '').subscribe(res => {
            if (res) {
                let dataArray = [];
                let Customers = [];
                this.dashBoardDetails = res;
                if (this.dashBoardDetails && this.dashBoardDetails.totalOrdersCount) {
                    this.ordersCount = this.dashBoardDetails.totalOrdersCount;
                    // totalOrdersSummayLabels
                    this.ordersCount.forEach(order => {
                        this.totalOrdersSummayLabels.push(order._id);
                        this.totalOrdersSummayData.push(order.count);
                    });
                }

                // to get the data for month orders chart
                if (this.dashBoardDetails && this.dashBoardDetails.orderChartCounts && this.dashBoardDetails.orderChartCounts.length) {
                    for (var i = 0; i < this.dashBoardDetails.orderChartCounts.length; i++) {
                        for (var j = 0; j < this.Month.length; j++) {
                            if (this.dashBoardDetails.orderChartCounts[i].month === this.Month[j].val) {
                                this.sellerBuyerLabels.push(this.Month[j].month);
                                dataArray.push(this.dashBoardDetails.orderChartCounts[i].count);
                            }
                        }
                    }
                }
                this.appService.loaderStatus('none');
                this.ordersLineChartData = [{ data: dataArray, label: 'Orders' }];

                //For Customers number for months
                if (this.dashBoardDetails && this.dashBoardDetails.buyerChartCounts && this.dashBoardDetails.buyerChartCounts.length) {
                    for (var i = 0; i < this.dashBoardDetails.buyerChartCounts.length; i++) {
                        for (var j = 0; j < this.Month.length; j++) {
                            if (this.dashBoardDetails.buyerChartCounts[i].month === this.Month[j].val) {
                                Customers.push(this.dashBoardDetails.buyerChartCounts[i].count);
                            }
                        }
                    }
                }
                this.appService.loaderStatus('none');
                this.CustomerChartData = [{ data: Customers, label: 'Customers' }];

            }
        });
    }

    // For Low Stock Invenotory
    getLowStockProducts() {
        let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
        let url = 'entities/getLowStockList?filter=' + JSON.stringify(filterCriteria);
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.entities && res.entities.length && res.entities.length > 0) {
                this.lowStockProducts = res.entities;
                this.lowStockProducts.forEach((product, index) => {
                    product.sno = index + 1;
                });
            } else {
                this.lowStockProducts = [];
            }
        })
    }

    //Poducts never purchades
    getProductsNeverPurchased() {
        let url = 'entities/getNeverPurchasedProductsList';
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.entities && res.entities.length && res.entities.length > 0) {
                this.neverPurchasedProducts = res.entities;
                // for (let i = 0; i < this.latestOrders.length; i++) {
                //     this.latestOrders[i].sno = i + 1;
                //     if (this.latestOrders[i].created) {
                //         this.latestOrders[i].created = moment(this.latestOrders[i].created).format(this.configFn.userFormat);
                //     }
                // }
            } else {
                this.neverPurchasedProducts = [];
            }
        })
    }

    //Get Lateste Reviews
    getLatestReviews() {
        let filterCriteria = { "limit": 5, "sortfield": "created", "direction": "desc" };
        filterCriteria['criteria'] = [];
        filterCriteria['criteria'].push({
            "key": "ownerId",
            "value": this.loginVendorid,
            "type": "in"
        });
        let url = 'sellers/reviews?filter=' + JSON.stringify(filterCriteria);
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.reviews && res.reviews.length && res.reviews.length > 0) {
                this.latestReviews = res.reviews;
                this.latestReviews.forEach((review, index) => {
                    review.sno = index + 1;
                });
            } else {
                this.latestReviews = [];
            }
        })

    }

    //Navigate TO USer Details
    goToUserDetails(data) {
        this.router.navigate(['/userdetails/' + data.userId]);
    }
    //Get Local storage
    getLocalStorageData() {
        if (localStorage.getItem('vendor')) {
            let vendor = JSON.parse(localStorage.getItem('vendor'));
            if (vendor && vendor.vendor && vendor.vendor._id) {
                this.loginVendorid = vendor.vendor._id;
            }

        }
    }

}


