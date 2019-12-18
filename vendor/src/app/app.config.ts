import { Injectable } from '@angular/core';
import { Color, RGB, HEX } from './app.color';
import 'sass-to-js/js/src/sass-to-js.js';
import { IMyOptions } from 'mydatepicker';
@Injectable({ providedIn: 'root' })
export class AppConfig {

    sassVariables: any;
    config: any;
    serverUrl: any;
    imageUrl: any;
     months:any = [1,2,3,4,5,6,7,8,9,10,11,12];
    monthNames:any =['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    projectName: String = 'Bux Super Store'; // need to change in angular.json,package.json,index.html

    userFormat = 'MM/DD/YYYY';
    dbFormat = 'YYYY-MM-DD';
    myDatePickerOptions: IMyOptions = {
        todayBtnTxt: 'Today',
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo',
        sunHighlight: true,
        height: '30px',
        inline: false,
        selectionTxtFontSize: '14px',
        editableDateField: false,
        openSelectorOnInputClick: true,
        openSelectorTopOfInput: true,
        showClearDateBtn: false

    };

    constructor() {
        this.sassVariables = this.getSassVariables();
        this.config = {
            name: this.projectName,
            title: this.projectName,
            version: '2.3.0',
            colors: {
                main: this.sassVariables['main-color'],
                default: this.sassVariables['default-color'],
                dark: this.sassVariables['dark-color'],
                primary: this.sassVariables['primary-color'],
                info: this.sassVariables['info-color'],
                success: this.sassVariables['success-color'],
                warning: this.sassVariables['warning-color'],
                danger: this.sassVariables['danger-color'],
                sidebarBgColor: this.sassVariables['sidebar-bg-color'],
                gray: this.sassVariables['gray'],
                grayLight: this.sassVariables['gray-light']
            }
        }


        this.serverUrl= 'http://shopapi.renkomarket.com/api/';
        this.imageUrl = "http://shopapi.renkomarket.com:5900/";
      

    }

    getSassVariables() {
        let variables = jQuery('body').sassToJs({ pseudoEl: "::after", cssProperty: "content" });
        return variables;
    }

    rgba(color, opacity) {
        if (color.indexOf('#') >= 0) {
            if (color.slice(1).length == 3) {
                color = '#' + color.slice(1) + '' + color.slice(1);
            }
            return new Color(new HEX(color)).setAlpha(opacity).toString();
        }
        else {
            console.log("incorrect color: " + color);
            return 'rgba(255,255,255,0.7)';
        }
    }

}