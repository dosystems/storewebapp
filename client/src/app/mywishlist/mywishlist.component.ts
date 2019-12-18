import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';
import { NavbarService } from '../navbar.service';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'ross-mywishlist',
  templateUrl: './mywishlist.component.html',
  styleUrls: ['./mywishlist.component.css']
})
export class MywishlistComponent implements OnInit {
  totalRecords: any;
  wishlistProducts: any = [];
  pages: any;
  noProducts: any=false;
  constructor(public router: Router, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService, public NavService: NavbarService) { }

  ngOnInit() {
    this.getAllwishListProducts();
  }
  //For Getting All the Products 
  getAllwishListProducts() {
    this.wishlistProducts=[];
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', 'favorites', '').subscribe(res => {
      if (res.favorites && res.favorites.length > 0) {
        let favs = res.favorites;
        if (favs && favs.length > 0)
          favs.forEach(fav => {
            fav.entity.favId = fav._id;
            this.wishlistProducts.push(fav.entity);
          });
        window.scrollTo(0, 0);
        this.noProducts = false;
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
          this.pages = Math.ceil(this.totalRecords / this.appConfig.productsPerPage);
        }
        this.appService.loaderStatus('none');
      } else {
        window.scrollTo(0, 0);
        this.noProducts = true;
        this.wishlistProducts = [];
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.wishlistProducts = [];
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }



  // to remove fav of product

  removeFromWishList(favId, productId) {
    if (!localStorage.getItem('userToken')) {
      this.toastr.warning('Please login to continue');
      return;
    }
    this.appService.manageHttp('delete', `favorites/${favId}`, '')
      .subscribe(res => {
        if (res && res.respCode && res.respCode === 206) {
          this.toastr.success("Product removed from Wishlist");
          this.getAllwishListProducts();
        } else {
          this.toastr.error(res.errorMessage);
        }
      }, (error) => {
        this.toastr.error(' something went wrong');
      });
  }

}
