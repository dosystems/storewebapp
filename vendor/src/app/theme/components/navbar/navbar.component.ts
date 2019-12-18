import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../app.service';
import { AppConfig } from '../../../app.config';
import { AppState } from '../../../app.state';
import { NavbarService } from '../../../navbar.service';
declare var $: any;

@Component({
    selector: 'az-navbar',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    public isMenuCollapsed: boolean = false;
    loginVendorDetails: any;
    imageUrlPath: any;

    constructor(public navService: NavbarService, private _state: AppState, public router: Router, private toastrService: ToastrService, public appService: AppService, public appConfig: AppConfig) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
        this.getLocalStorageData();
        this.imageUrlPath = this.appConfig.imageUrl + 'seller/';
        //Accesing navbar service
        this.navService.componentMethodCalled$.subscribe(
            () => {
                this.getLocalStorageData();
            }
        );

    }

    ngOnInit() {

    }

    public closeSubMenus() {

    }

    public toggleMenu() {
        this.isMenuCollapsed = !this.isMenuCollapsed;
        this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    }

    // On click logout
    logout() {
        localStorage.clear();
        $('#logoutModal').modal('hide');
        this.toastrService.success('Logged out successfully')
        this.router.navigate(['/login']);
    }

    getLocalStorageData() {
        if (localStorage.getItem('vendor')) {
            let vendor = JSON.parse(localStorage.getItem('vendor'));
            if (vendor && vendor.vendor && vendor.vendor._id) {
                this.loginVendorDetails = vendor.vendor;
            }
        }
    }
}
