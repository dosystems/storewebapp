import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from "../../../app.config";
import { AppService } from "../../../app.service";

@Component({
    selector: 'az-pie-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pie-chart.component.html'
})
export class PieChartComponent {
    public config: any;
    public configFn: any;
    chartMap: any = new Map();

    public pieChartType: string = 'pie';
    public pieChartLabels: any = [];
    public pieChartData: any = [];
    public pieChartColors: any[];
    public pieChartOptions: any;

    constructor(private _appConfig: AppConfig, public appService: AppService) {
        this.config = this._appConfig.config;
        this.configFn = this._appConfig;
        this.getCountryWiseSale();
    }

    ngOnInit() {

        //this.pieChartLabels = ['India', 'USA', 'China'];
        //this.pieChartData = [150, 570, 300]; 
        this.pieChartColors = [
            {
                backgroundColor: [
                    this.configFn.rgba(this.config.colors.success, 0.7),
                    this.configFn.rgba(this.config.colors.warning, 0.7),
                    this.configFn.rgba(this.config.colors.danger, 0.7),
                    this.configFn.rgba(this.config.colors.gray, 0.7),
                    this.configFn.rgba(this.config.colors.info, 0.7)
                ],
                hoverBackgroundColor: [
                    this.config.colors.success,
                    this.config.colors.warning,
                    this.config.colors.danger,
                    this.config.colors.gray,
                    this.config.colors.info
                ],
                borderColor: this.config.colors.grayLight,
                borderWidth: 1,
                hoverBorderWidth: 3
            }
        ];
        this.pieChartOptions = {
            title: {
                display: true,
                text: 'Country Wise Sales Information With %',
                fontColor: this.config.colors.gray,
                fontSize: 14,
                fontStyle: 'normal'
            },
            legend: {
                labels: {
                    fontColor: this.configFn.rgba(this.config.colors.gray, 0.9),
                }
            },
            tooltips: {
                enabled: true,
                backgroundColor: this.configFn.rgba(this.config.colors.main, 0.7),
                callbacks: {
                    label: function (tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });
                        var currentValue = dataset.data[tooltipItem.index];
                        var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
                        return data.labels[tooltipItem.index] + ': ' + precentage + '%';
                    }
                }
            }
        }

    }

    getCountryWiseSale() {
        let url = 'orders?filter={"criteria":[{"key":"status","value":["Delivered","Shipped","Paid"],"type":"in"}]}';
        this.appService.manageHttp('get', url, '').subscribe(res => {
            if (res && res.orders && res.orders.length && res.orders.length > 0) {
                let orders = res.orders;
                for (let i = 0; i < orders.length; i++) {
                    if (orders[i].shipmentAddress && orders[i].shipmentAddress.country) {
                        if (this.chartMap.has(orders[i].shipmentAddress.country)) {
                            let count;
                            count = this.chartMap.get(orders[i].shipmentAddress.country) + 1;
                            this.chartMap.set(orders[i].shipmentAddress.country, count);
                        } else {
                            this.chartMap.set(orders[i].shipmentAddress.country, 1);
                        }
                    }
                }
                //this.chartMap.set("China",12);                            
                this.chartMap.forEach((value, label) => {
                    this.pieChartLabels.push(label);
                    this.pieChartData.push(value);
                });
            }
        })
    }



    public randomizeType(): void {
        this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
    }

    public chartClicked(e: any): void {
        // console.log(e);
    }

    public chartHovered(e: any): void {
        // console.log(e);
    }


}
