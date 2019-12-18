import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { AppState } from '../app.state';
import { AppConfig } from '../app.config';

@Component({
    selector: 'az-pages',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
    providers: [AppState, AppConfig]
})
export class PagesComponent implements OnInit {

    public isMenuCollapsed: boolean = false;

    constructor(private _state: AppState,
        private _location: Location, public appConfig: AppConfig) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
    }

    ngOnInit() {
        this.getCurrentPageName();
    }

    public getCurrentPageName(): void {
        let url = this._location.path();
        let hash = (window.location.hash) ? '#' : '';
        setTimeout(function () {
            let subMenu = jQuery('a[href="' + hash + url + '"]').closest("li").closest("ul");
            window.scrollTo(0, 0);
            subMenu.closest("li").addClass("sidebar-item-expanded");
            subMenu.slideDown(250);
        });
    }

    public hideMenu(): void {
        this._state.notifyDataChanged('menu.isCollapsed', true);
    }

    public ngAfterViewInit(): void {
        document.getElementById('preloader').style['display'] = 'none';
    }

}
