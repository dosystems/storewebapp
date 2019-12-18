import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import 'rxjs/add/operator/map';
import { NavbarService } from './navbar.service';
import { AppConfig } from "./app.config";
interface response1 {
    errorCode: number;
    respMessage: string;
    respCode: number;
    fileName: any;
}
@Injectable({ providedIn: 'root' })

export class AppService {
    token: any;
    respCode200: Number = 200;
    respCode204: Number = 204;
    respCode205: Number = 205;
    respCode206: Number = 206;
    respCode9001: Number = 9001;
    rowNum: any = 20;
    rowValue: any = [5, 10, 20];
    name: any = ' Ross Admin';
    logoPath: any = 'assets/img/logo/az_logo.png';
    fullLogoPath: any = ' assets/img/logo/az_logo_full.png';
    loginEmpDetails: any = {};
    pageNumber: any;
    selectedCurrency;
    defaultCurrency:any;
    buxCurrency:any='BUX';
    constructor(public NavService:NavbarService,public http: HttpClient, public router: Router, public appConfig: AppConfig) {
        this.getLocalStorageData();
        this.getCurrencySelected();
        this.defaultCurrency=this.appConfig.defaultCurrency;
        this.NavService.componentMethodCalledCurrency$.subscribe(
            () => {
              this.getCurrencySelected();
            }
          );
    }

    setHeaders() {
        let headers = new HttpHeaders()
            .append('Content-Type', 'application/json')
            .append('Authorization', "Bearer" + ' ' + localStorage.getItem('userToken'));
        return headers;
    }

    // To get logged in user data from localstorage
    getLocalStorageData() {
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            if (user && user.user && user.user._id) {
                this.loginEmpDetails = user.user;
            }
            if (localStorage.getItem('userToken')) {
                this.token = localStorage.getItem('userToken');
            }
        }
    }

    manageHttp(method: any, url: any, body: any,type?:any) {
        let toRunMethod;
        let urlto;
        let headers = this.setHeaders();
        if(type){
            urlto=url;
        }else{
            urlto = this.appConfig.serverUrl + '' + url;
        }
        
        if (method === 'get') {
            toRunMethod = this.http.get(urlto, { headers: headers });
        } else if (method === 'post') {
            toRunMethod = this.http.post(urlto, body, { headers: headers });
        } else if (method === 'put') {
            toRunMethod = this.http.put(urlto, body, { headers: headers });
        } else if (method === 'delete') {
            toRunMethod = this.http.delete(urlto, { headers: headers });
        }
        return toRunMethod.map((response) => {
            // More than one user - logout
            if (response && response.errorCode && response.errorCode === '9003') {
                localStorage.removeItem('user');
                localStorage.removeItem('userToken');
                this.router.navigate(['/login']);
            } else {
                return response;
            }
        }, (error) => {
            this.authGuardMethod(error);
        });

    }
    // common loader
    loaderStatus(status: any) {
        document.getElementById('loader').style['display'] = status;
    }
    authGuardMethod(error: any) {
        if (error) {
            if (error.statusText === "Unauthorized") {
                localStorage.setItem("error", '1');
                this.router.navigate(['/login']);
            }
        } else {
            localStorage.setItem("error", '2');
            this.router.navigate(['/login']);
        }
    }


    

    // export to csv
    exportToCSV(data: any, filterLabels: any, fileName: any, fileCount: any, countObj: any) {
        if (data && filterLabels && fileName) {
            var csv = '\ufeff';
            if (countObj) {
                if (countObj['lables']) {
                    for (var p = 0; p < countObj['lables'].length; p++) {
                        if (countObj['lables'][p]) {
                            csv += '"' + countObj['lables'][p] + '"';
                            if (p < countObj['lables'].length - 1) {
                                csv += ',';
                            }
                        }
                    }
                }
                csv += '\n';
                if (countObj['lablesValues']) {
                    for (var t = 0; t < countObj['lablesValues'].length; t++) {
                        if (countObj['lablesValues'][t]) {
                            csv += '"' + countObj['lablesValues'][t] + '"';
                            if (t < countObj['lablesValues'].length - 1) {
                                csv += ',';
                            }
                        }
                    }
                }
                csv += '\n\n';
            }

            for (var i = 0; i < filterLabels.length; i++) {
                if (filterLabels[i]) {
                    csv += '"' + (filterLabels[i]) + '"';
                    if (i < (filterLabels.length - 1)) {
                        csv += ',';
                    }
                }
            }

            data.forEach(function (record, i) {
                csv += '\n';
                for (var i_1 = 0; i_1 < filterLabels.length; i_1++) {
                    if (filterLabels[i_1]) {
                        if (record && filterLabels[i_1]) {
                            if (filterLabels[i_1].indexOf('.') == -1) {
                                csv += '"' + record[filterLabels[i_1]] + '"';
                            } else {
                                var fields = filterLabels[i_1].split('.');
                                var value = record;
                                for (var i2 = 0, len = filterLabels[i_1].length; i2 < len; ++i2) {
                                    if (value == null) {
                                        csv += '"' + null + '"';
                                    }
                                    value = value[filterLabels[i_1][i2]];
                                }
                                csv += '"' + value + '"';
                            }
                        } else {
                            csv += '"' + null + '"';
                        }
                        if (i_1 < (filterLabels.length - 1)) {
                            csv += ',';
                        }
                    }
                }
            });
            var blob = new Blob([csv], {
                type: 'text/csv;charset=utf-8;'
            });
            if (window.navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(blob, fileName + fileCount + '.csv');
            } else {
                var link = document.createElement("a");
                link.style.display = 'none';
                document.body.appendChild(link);
                if (link.download !== undefined) {
                    link.setAttribute('href', URL.createObjectURL(blob));
                    link.setAttribute('download', fileName + fileCount + '.csv');
                    link.click();
                } else {
                    csv = 'data:text/csv;charset=utf-8,' + csv;
                    window.open(encodeURI(csv));
                }
                document.body.removeChild(link);
            }
        }
    }

        // to capitalize the text
        capitalize(string) {
            return string.toLowerCase().replace(/^.|\s\S/g, function (a) { return a.toUpperCase(); });
        }


    // upload input 
    fileUpload(input: any, field_name: any, urlpath: any) {
        let file;
        if (input.file) {
            file = input.file;
        } else if (input && input.name) {
            file = input;
        }
        //   this.loaderStatus('block');
        var headers = new HttpHeaders()
            .append('Authorization', "Bearer" + ' ' + this.token);
        let formData: FormData = new FormData();
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        formData.append(field_name, file);
        return this.http.post(this.appConfig.serverUrl + urlpath, formData, { headers: headers })
            .map((res: response1) => res)
    }

    // To get logged in user object id
    getLoggedInUserId() {
        if (localStorage.getItem('user')) {
            let loggedInUserObjId;
            let user = JSON.parse(localStorage.getItem('user'));
            if (user && user.user && user.user._id) {
                return loggedInUserObjId = user.user._id;
            }
        }
    }

    // To get all orders list
    getOrdersList(status?: any) {
        let loggedInUserObjId = this.getLoggedInUserId();

        let filterCriteria = {};
        let criteria = [];

        filterCriteria['sortfield'] = 'created';
        filterCriteria['direction'] = 'desc';

        criteria.push({ "key": 'userId', "value": loggedInUserObjId, "type": "eq" });
        criteria.push({ "key": 'status', "value": status, "type": "regexOr" });

        if (criteria && criteria.length > 0) {
            filterCriteria['criteria'] = criteria;
        }
        let url = `Orders?filter=${JSON.stringify(filterCriteria)}`;
        return this.manageHttp('get', url, '');
    }


    getEnLanguage(type: any) {
        let Data = {};
        Data = {
            en: {
                "common_minimum_password_error": "Your password must be a minimum of 8 characters.",
                "common_password_validity_error": "Your password must contain 3 of the following: one upper case, one lower case, one numeric, or one special character.",
                "common_password_match_error": "Passwords do not match",
                "common_oldpassword_and_newpassword_match_error": "Current password and new password should not be same",
                "common_valid_dob_error": "Please Entered Valid Date",
                "common_dob_lessthan_today_error": "Date Of Birth Should Be Less Than Today's Date",
                "common_min_islessthan_max_error": "Enter min age should be less than max",
                "common_alternate_inputs_validity_error": "Enter Atleast One Input To Alternate Search",

                "email_required_message": "The Email Address is required",
                "invalid_email_message": "The field email addresss is not a valid email address",
                "password_required_message": "Password is required",
                "password_minimum_6char_message": "Password isn't long enough, minimum of 6 characters"
            }
        }
        return Data['en'][type];
    }

    handleNull(data: any) {
        if (data && data.length > 0) {
            var keys = Object.keys(data[0])
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < keys.length; j++) {
                    if (data[i][keys[j]] === null || undefined) {
                        data[i][keys[j]] = '';
                    }
                }
            }
            return data;
        }
    }

    // common loader
    /*    loaderStatus(status: any) {
            document.getElementById('loader').style['display'] = status;
        }*/

    // status colors
    getStatusColor(status: any) {
        let statusColor;
        if (status === 'Pending') {
            statusColor = 'warning';
        } else if (status === 'Active') {
            statusColor = 'success';
        } else if (status === 'Inactive' || status === 'Completed') {
            statusColor = 'danger';
        } else if (status === 'Request') {
            statusColor = 'primary';
        } else {
            statusColor = 'info';
        }
        return statusColor;
    }

    // to remove extra tags in the description of editor
    formatEditorData(text) {
        var description = text;
        description = description.replace(/<\/p>\\*/g, "").replace(/<p>\\*/g, "").replace(/<br>\\*/g, "").replace(/ /g, "").replace(/&nbsp;\\*/g, "");;
        if (description.length < 1) {
            return '';
        } else {
            return text;
        }
    }

    //For Formating Date
    getdbFormatDate(field) {
        var serviceData;
        if (field && field.formatted) {
            serviceData = moment(field.formatted).format('YYYY-MM-DD');
        } else if (field.date) {
            serviceData = moment(field.date).format('YYYY-MM-DD');
        } else {
            serviceData = moment(field).format('YYYY-MM-DD');
        }
        return serviceData;
    }

    //For Formating Date In EditForm
    getdateFormatinEdit(field) {
        let date;
        date = { date: moment(field).format('DD/MM/YYYY') };
        return date;
    }

    // for filtering and sorting elements
    EventData(event?: any, searchFilterLabels?: any, defaultSortField?: any, sortDirection?: any) {

        // To apply pagination 
        let currentPage: number = 1;
        if (event && event.first && event.rows) {
            currentPage = event.first / event.rows + 1;
        }

        if (currentPage === 1) {
            this.pageNumber = 0;
        }

        let filterCriteria = {};
        var criteria = [];

        filterCriteria['page'] = currentPage;
        if (event) {
            // To assign soting direction
            if (event.sortOrder == 1) {
                if (sortDirection) {
                    event.direction = 'asc';
                } else {
                    event.direction = 'desc';
                }
            } else if (event.sortOrder == -1) {
                if (sortDirection) {
                    event.direction = 'desc';
                } else {
                    event.direction = 'asc';
                }
            }
            // To assign sorting field
            if (!event.sortField) {
                if (defaultSortField) {
                    event.sortField = defaultSortField;
                } else {
                    event.sortField = 'created';
                }
            }

            filterCriteria['limit'] = event.rows;
            filterCriteria['sortfield'] = event.sortField;
            filterCriteria['direction'] = event.direction;
        } else {
            filterCriteria['limit'] = this.rowNum;
            //  To assign soting field
            if (defaultSortField) {
                filterCriteria['sortfield'] = defaultSortField;
            } else {
                filterCriteria['sortfield'] = 'created';
            }
            // To assign soting direction
            if (sortDirection) {
                filterCriteria['direction'] = sortDirection;
            } else {
                filterCriteria['direction'] = 'desc';
            }
        }
        if (event && event.globalFilter) {
            if (event.globalFilter.length && event.globalFilter.length < 3) {
                return;
            }

            let globalSearchType: any;

            if (event.globalFilterSearchType) {
                globalSearchType = event.globalFilterSearchType;
            } else {
                globalSearchType = "user";
            }
            filterCriteria['globalSearch'] = { "value": event.globalFilter.trim(), "type": globalSearchType };
        }
        if (event && event.filters && (Object.keys(event.filters).length > 0)) {
            let filterLabels = searchFilterLabels;
            let filterObj = event.filters;
            var criteria = [];
            var filterSearchType;
            var otherFilterCase;
            var userIdFilterCase;
            if (filterLabels && filterLabels.length > 0) {
                filterLabels.forEach(function (v) {
                    if (filterObj && filterObj[v] && filterObj[v].value) {

                        // To change search type
                        if (filterObj[v].matchMode && filterObj[v].matchMode == "equals") {
                            filterSearchType = "eq";
                        } else {
                            filterSearchType = "regexOr";
                        }
                        // To check length of value in filter
                        if (v == 'created' || v == 'visibleDate' || v == 'expiryDate' || v == 'startDate' || v == 'endDate') {
                            if (filterObj[v].value.length < 9) {
                                return otherFilterCase = true;
                            }
                            let startDate = moment(filterObj[v].value).format("YYYY-MM-DD");
                            let endDate = moment(startDate).add(1, 'd').format("YYYY-MM-DD");

                            criteria.push({ "key": v, "value": startDate, "type": "gteDate" }, { "key": v, "value": startDate, "type": "lteDate" });
                        }
                        if (v == 'inventory.Price' || v == 'price' || v == 'actualAmount'  || v == 'amount') {
                            if (filterObj[v].value.length < 3) {
                                return otherFilterCase = true;
                            }
                            var price = filterObj[v].value;
                            var priceRange = price.split('-');
                            if (priceRange.length === 2) {
                                priceRange[0] = parseFloat(priceRange[0]);
                                priceRange[1] = parseFloat(priceRange[1]);

                                if (priceRange[0] < priceRange[1]) {
                                    criteria.push({ "key": v, "value": priceRange[0], "type": "gte" });
                                }
                                if (priceRange[0] > priceRange[1]) {
                                    criteria.push({ "key": v, "value": priceRange[1], "type": "gte" });
                                }
                                if (priceRange[1] > priceRange[0]) {
                                    criteria.push({ "key": v, "value": priceRange[1], "type": "lte" });
                                }
                                if (priceRange[1] < priceRange[0]) {
                                    criteria.push({ "key": v, "value": priceRange[0], "type": "lte" });
                                }
                            } else if (priceRange.length == 1) {
                                criteria.push({ "key": v, "value": parseFloat(priceRange[0]), "type": "eq" });
                            }
                        }

                        else if (filterSearchType && filterSearchType == "regexOr" && filterObj[v].value.length < 3) {
                            return otherFilterCase = true;
                        }

                        if (v == "firstName") {
                            filterObj[v].value = filterObj[v].value.trim();
                            var fullName = filterObj[v].value.split(" ");
                            if (fullName[0]) {
                                var firstname = fullName[0];
                            }
                            if (fullName[1]) {
                                var lastName = fullName[1];
                            }
                            if (firstname && lastName) {
                                criteria.push({ "key": v, "value": firstname, "type": "regexOr" });
                                criteria.push({ "key": "lastName", "value": lastName, "type": "regexOr" });
                            } else if (firstname) {
                                criteria.push({ "key": v, "value": firstname, "type": "regexOr" });
                            } else if (lastName) {
                                criteria.push({ "key": "lastName", "value": lastName, "type": "regexOr" });
                            } else {
                                criteria.push({ "key": v, "value": filterObj[v].value, "type": "regexOr" });
                            }
                        } else {
                            let filterVlaue;
                            if (filterObj[v].searchFormatType) {
                                filterVlaue = parseFloat(filterObj[v].value);
                            } else {
                                filterVlaue = filterObj[v].value.trim();
                            }
                            if (v !== 'created' && v !== 'visibleDate' && v !== 'expiryDate' && v != 'inventory.Price' &&
                                v != 'price' && v != 'actualAmount' && v != 'startDate' && v != 'endDate' && v!= 'amount') {
                                criteria.push({ "key": v, "value": filterVlaue, "type": filterSearchType });
                            }
                        }
                    }
                });
                if (otherFilterCase == true || userIdFilterCase == true) {
                    return 'invalidData';
                }
            }
        }


        if (criteria && criteria.length > 0) {
            filterCriteria['criteria'] = criteria;
        }
        return filterCriteria;

    }

    // Validate only numbers and special characters ( with out accept Float values )
    Validate(event, type) {
        var regex = new RegExp(event.regEx);
        var charCode = !event.charCode ? event.which : event.charCode;
        // check for tab & backspace for Firefox:
        if ([0, 8].indexOf(charCode) !== -1) return;
        var key = String.fromCharCode(charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }

        var regex = new RegExp("^[0-9]");//RegExp("^[0-9-+().!@#$%*?]");

        var key = String.fromCharCode(event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }


    getCurrencySelected(){
        if(localStorage.getItem('currency')){
          this.selectedCurrency= JSON.parse(localStorage.getItem('currency'));
        }else{
          this.selectedCurrency=this.appConfig.defaultCurrency;
        }
      }

      //For Decimal Values
    decimalValues(val) {
        return parseFloat(val).toFixed(2);
    }

}