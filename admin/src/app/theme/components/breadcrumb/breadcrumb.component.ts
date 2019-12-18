import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd } from "@angular/router"; 
import { Title } from '@angular/platform-browser';
import { AppConfig } from "../../../app.config";

@Component({
    selector: 'az-breadcrumb',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./breadcrumb.component.scss'],
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent {
    public config:any;
    public title:string;
    public breadcrumbs: {
        name: string;
        url: string
    }[] = [];

    constructor(private _router: Router, 
                private _activatedRoute: ActivatedRoute,
                private _appConfig:AppConfig, 
                private _title:Title) {
        
        this.config = this._appConfig.config;
        this._router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.breadcrumbs = [];                
                this.parseRoute(this._router.routerState.snapshot.root); 
                this.title = "";
                this.breadcrumbs.forEach(breadcrumb => {
                    this.title += ' > ' + breadcrumb.name;
                })       
                this._title.setTitle(this.config.name + this.title);
            }
        })    
    }

    parseRoute(node: ActivatedRouteSnapshot) { 
        if (node.data['breadcrumb']) {
            if(node.url.length){
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => {
                    return urlSegment.path;
                }).join('/');
                this.breadcrumbs.push({
                    name: node.data['breadcrumb'],
                    url: '/' + url
                }) 
            }         
        }
        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }
}












