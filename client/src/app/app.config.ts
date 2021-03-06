import { Injectable } from '@angular/core';
import * as $ from 'jquery';
@Injectable()
export class AppConfig {

    userFormat = 'MM/DD/YYYY';
    dbFormat = 'YYYY-MM-DD';
    userFormat2='MMM Do YYYY';
    userFormat3='dddd,MMM.DD';
    serverUrl= 'https://api.buxsuperstore.com/api/';
    imageUrl =  "https://api.buxsuperstore.com/";
    productsPerPage:number = 15;
    ordersPerPage:number=10;
    projectName="BUX SUPER STORE";
    copyRight="© 2018 Bux Super Store. All Rights Reserved.";
    logo="assets/images/buxstorelogo.png";
    mobilelogo = "assets/images/moblogo.png";
    facebookLink='https://www.facebook.com/buxsuperstoreIn';
    twitterLink='https://twitter.com/BuxSuperstore';
    instagramLink='https://www.instagram.com/buxsuperstore/';
    sellerLink="https://vendor.buxsuperstore.com/registration";
    bitsolviesServerUrl="https://api.bitsolives.com/api/";
    bitsolivesLogo="assets/images/bitsoliveslogo.png";
    euroToBtcValue=0.13;
    orderPaymentStatus='AddToCart';
      shippingFromAddress={
        "name" : "ilyas11",
        "phone" : "998989898998",
        "address_line1" : "Dashwood House",
        "city_locality" : "London",
        "state_province" : "UK",
        "postal_code" : "EC2M 1QS",
        "country_code" : "GB"
    };
    defaultCurrency={name:'USD',symbol:'$'};
    currencies=[{name:'EUR',symbol:'€'},{name:'USD',symbol:'$'}];
    languages=[
        { name: 'English', value: 'en', flag: 'eng.png' },
        { name: 'French', value: 'fr', flag: 'fr.png' },
        { name: 'German', value: 'den', flag: 'den.png' }]
    paypalPaymentClientId: any = 'AZrpJ8sUdrw_6E_r33mBzzWlgd_bW7e69Cc2bCzsg8gaVSGy_5HBpQA8I0jr7ENSPrm6TvKISHoWKNKy';
    paypalLive:boolean=true;
    showDaysOfNewLabel=6;
    constructor() {
    }
    // load Countdown
    loadCountDown(){
        $('.countdown').each(function () {
            var countdown = $(this);
            var promoperiod;
            if (countdown.attr('data-promoperiod')) {
                promoperiod = new Date().getTime() + parseInt(countdown.attr('data-promoperiod'),10);
            }
            if (countdown.attr('data-promodate')) {
                promoperiod = countdown.attr('data-promodate');
            }
            countdown.countdown(promoperiod, function (event) {
                countdown.html(event.strftime('<span><span>%D</span>DAYS</span>' + '<span><span>%H</span>HRS</span>' + '<span><span>%M</span>MIN</span>' + '<span><span>%S</span>SEC</span>'));
            })
        });
    };
 loadScript(scriptUrl: string) {
        return new Promise((resolve, reject) => {
            const scriptElement = document.createElement('script');
            scriptElement.src = scriptUrl;
            scriptElement.onload = resolve;
            document.body.appendChild(scriptElement);
        });
    }

    
}