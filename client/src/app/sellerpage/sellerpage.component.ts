import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';
@Component({
  selector: 'ross-sellerpage',
  templateUrl: './sellerpage.component.html',
  styleUrls: ['./sellerpage.component.css']
})
export class SellerpageComponent implements OnInit {

  constructor(public appConfig:AppConfig) { }

  ngOnInit() {
  }

}
