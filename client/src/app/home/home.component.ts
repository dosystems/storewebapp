 import { Component,OnInit ,AfterViewInit} from '@angular/core';
import '../../assets/js/swiper/swiper.min.js';
import * as $ from 'jquery';
import { AppConfig } from '../app.config';
import { AppService } from "../app.service";
@Component({
  selector: 'ross-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  implements OnInit,AfterViewInit{

  constructor(public appConfig:AppConfig,public appService:AppService) {
    this.appService.loaderStatus('none');
   }
  ngOnInit(){
    // instagram feed
    this.loadInstgram()
    // end instagram feed
  
  }
  async ngAfterViewInit() {
    await setTimeout(()=>{    //<<<---    using ()=> syntax
      this.appConfig.loadScript('../../assets/js/app.js');
    }, 10);
  }
  // instagram feed
  loadInstgram() {
    function doStuff() {
      if ($(".instagramm-feed-full").has('a').length) {
        startInstagramCarousel();
        clearInterval(timer);
      }
    }

    function startInstagramCarousel() {
      $(".instagramm-feed-full").find('a').each(function () {
        $(this).attr('target', '_blank');
      });
      var $slider = $(".instagramm-feed-full").slick({
        speed: 700,
        slidesToShow: 10,
        slidesToScroll: 2,
        cssEase: 'linear',
        responsive: [{
          breakpoint: 993,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 2
          }
    }, {
          breakpoint: 769,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 2
          }
    }, {
          breakpoint: 481,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
    }]
      });
      var scroll,
        speed = 0;
      var stop = function () {
        clearInterval(scroll);
      }
      var rw = function () {
        stop();
        $slider.slick("slickPrev");
        scroll = setInterval(function () {
          $slider.slick("slickPrev");
        }, speed);
      };
      var fw = function () {
        stop();
        $slider.slick("slickNext");
        scroll = setInterval(function () {
          $slider.slick("slickNext");
        }, speed);
      }
      $("body").on("mouseenter", ".instagramm-feed-full .slick-next", fw)
        .on("mouseenter", ".instagramm-feed-full .slick-prev", rw)
        .on("mouseleave", ".instagramm-feed-full .slick-next, .instagramm-feed-full .slick-prev", stop);
    }

    // if ($("#instafeed").length) {

    //   var userFeed = new Instafeed({
    //     get: 'user',
    //     userId: 'self',
    //     accessToken: '3489650088.1d65fda.fffa13214cd847439dfb6e8639f98b2b',
    //     limit: 20,
    //     resolution: 'low_resolution',
    //     sortBy: 'most-recent'
    //   });
    //   userFeed.run();

       var timer = setInterval(doStuff, 100);

    // }
  }

}
