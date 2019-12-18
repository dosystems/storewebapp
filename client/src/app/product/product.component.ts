import { Component, OnInit, Input, Output, EventEmitter,ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import '../../assets/js/countdown/jquery.countdown.min.js';
import '../../assets/js/bootstrap.min.js';
import * as $ from 'jquery';
import { AppConfig } from '../app.config';
declare let $;
declare var $document, fn;
@Component({
  selector: 'ross-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  @Input() Product: any = {};
  product: any = {};
  entity: any = {};
  colorImages: any = [];
  productImages:any;
  rates = [1, 2, 3, 4, 5];
  constructor(public router: Router,public appConfig:AppConfig,public appService :AppService ,public toastr:ToastrService ) {
     this.productImages = this.appConfig.imageUrl + 'entity/m/';
  }

  ngOnInit() {
    // Countdown

    $('.countdown').each(function () {
      var countdown = $(this);
      var promoperiod;
      if (countdown.attr('data-promoperiod')) {
        promoperiod = new Date().getTime() + parseInt(countdown.attr('data-promoperiod'), 1000000);
      }
      if (countdown.attr('data-promodate')) {
        promoperiod = countdown.attr('data-promodate');
      }
      countdown.countdown(promoperiod, function (event) {
        countdown.html(event.strftime('<span><span>%D</span>DAYS</span>' + '<span><span>%H</span>HRS</span>' + '<span><span>%M</span>MIN</span>' + '<span><span>%S</span>SEC</span>'));
      })
    });


    // colorswatch
    function colorSwatch(link) {
      var link: any = link + ' a';
      $document.on('click', link, function (e) {
        var $el = $(this);
        if ($el.data('image')) {
          var $image = $el.closest('.product-item-inside').find('img.product-image-photo');
          // if inner carousel in product
          if ($el.closest('.product-item-inside').find('.carousel-inside').length) {
            $el.closest('.product-item-inside').find('.carousel-inside').carousel(0);
            $image = $el.closest('.product-item-inside').find('.product-item-photo .item:first-child img');
          }
          var imgSrc = $el.data('image');
          $el.closest('ul.color-swatch').find('li').removeClass('active');
          $el.parent('li').addClass('active');
          var newImg = document.createElement("img");
          newImg.src = $el.data('image');
          newImg.onload = function () {
            $image.attr('src', $el.data('image'))
          }
        }
        e.preventDefault();
      })
    }
  }

 /* Router For Navigating to Product Details With Data*/
  gotoDetails(Product) {
    this.router.navigate(['/details/'+ Product.productId]);
  }
 


}


