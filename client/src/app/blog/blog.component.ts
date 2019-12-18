import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'ross-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // from blog carousel
    this.loadBlogCaurosel();
  }
  // load blog carousel
  loadBlogCaurosel(){
    // from blog carousel
    if ($(".blog-carousel").length) {
      var $this = $(".blog-carousel"),
        arrowsplace = $this;

      var $carouseltitle = $this.prev('.title');

      if ($this.parent().hasClass('collapsed-content')) {
        $carouseltitle = $this.parent().prev('.title');
      }
      if ($carouseltitle.find('.carousel-arrows').length) {
        arrowsplace = $carouseltitle.find('.carousel-arrows');
      }
      $this.slick({
        rows: 1,
        appendArrows: arrowsplace,
        slidesToShow: 2,
        slidesToScroll: 2,
        speed: 500,
        infinite: false,
        responsive: [{
          breakpoint: 1401,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
              }, {
          breakpoint: 1201,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
              }, {
          breakpoint: 993,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
              }, {
          breakpoint: 769,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
              }, {
          breakpoint: 481,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
              }]
      });
    }
  }

}
