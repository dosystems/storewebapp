import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../app.service';
import { AppState } from '../../../app.state';
declare var $: any;

@Component({
    selector: 'az-navbar',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
    public isMenuCollapsed: boolean = false;

    constructor(private _state: AppState, public router: Router, private toastrService: ToastrService,public appService:AppService ) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
        this.appService.getLocalStorageData();
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

}
