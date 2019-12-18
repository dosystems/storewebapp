import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import 'rxjs/add/operator/map';
import { AppConfig } from "./app.config";
import { ToastrService } from 'ngx-toastr';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';


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
    name: any = ' Ross Vendor';
    logoPath: any = 'assets/img/logo/az_logo.png';
    fullLogoPath: any = ' assets/img/buxstorelogo.png';
    loginVendorDetails: any = {};
    pageNumber: any;
    serverErrorMessage: any = 'Something went wrong';

    myDatePickerOptions: IMyDpOptions = {
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
        showClearDateBtn: false,
    };

    constructor(public http: HttpClient, private toastrService: ToastrService, public router: Router, public appConfig: AppConfig) {
        this.getLocalStorageData();
        let presentDate = new Date();
        let todayDate = moment(presentDate.setDate(presentDate.getDate() - 1)).format(this.appConfig.userFormat);
        if (todayDate) {
            this.myDatePickerOptions.disableUntil = { year: Number(todayDate.split('/')[2]), month: Number(todayDate.split('/')[0]), day: Number(todayDate.split('/')[1]) };
        }
    }

    setHeaders() {
        let headers = new HttpHeaders()
            .append('Content-Type', 'application/json')
            .append('Authorization', "Bearer" + ' ' + localStorage.getItem('vendorToken'));
        return headers;
    }

    // To get logged in vendor data from localstorage
    getLocalStorageData() {
        if (localStorage.getItem('vendor')) {
            let vendor = JSON.parse(localStorage.getItem('vendor'));
            if (vendor && vendor.vendor && vendor.vendor._id) {
                this.loginVendorDetails = vendor.vendor;
            }
            if (localStorage.getItem('vendorToken')) {
                this.token = localStorage.getItem('vendorToken');
            }
        }
    }

    manageHttp(method: any, url: any, body: any) {
        let toRunMethod;
        let headers = this.setHeaders();
        var urlto = this.appConfig.serverUrl + '' + url;
        if (method === 'get') {
            toRunMethod = this.http.get(urlto, { headers: headers });
        } else if (method === 'post') {
            toRunMethod = this.http.post(this.appConfig.serverUrl + url, body, { headers: headers });
        } else if (method === 'put') {
            toRunMethod = this.http.put(this.appConfig.serverUrl + url, body, { headers: headers });
        } else if (method === 'delete') {
            toRunMethod = this.http.delete(this.appConfig.serverUrl + url, { headers: headers });
        }
        return toRunMethod.map((response) => {
            // More than one user - logout
            if (response && response.errorCode && response.errorCode === '9003') {
                localStorage.removeItem('vendor');
                localStorage.removeItem('vendorToken');
                this.router.navigate(['/login']);
            } else {
                return response;
            }
        }, (error) => {
            this.authGuardMethod(error);
        });

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




    // upload input 
    fileUpload(input: any, field_name: any, urlpath: any) {
        let file;
        if (input.file) {
            file = input.file;
        } else if (input && input.name) {
            file = input;
        }
        this.loaderStatus('block');
        var headers = new HttpHeaders()
            .append('Authorization', "Bearer" + ' ' + this.token);
        let formData: FormData = new FormData();
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        formData.append(field_name, file);
        return this.http.post(this.appConfig.serverUrl + urlpath, formData, { headers: headers })
            .map((res: response1) => res)
    }



    // upload  multiple Images 
    multipleFileUpload(images: any, field_name: any, urlpath: any) {
        let file;
        this.loaderStatus('block');
        var headers = new HttpHeaders()
            .append('Authorization', "Bearer" + ' ' + localStorage.getItem('vendorToken'));
        let formData: FormData = new FormData();
        let xhr: XMLHttpRequest = new XMLHttpRequest();

        for (var i = 0; i < images.length; i++) {
            if (images[i] && images[i].image && images[i].image.file) {
                file = images[i].image.file;
            }
            formData.append(field_name, file);
        }

        return this.http.post(this.appConfig.serverUrl + urlpath, formData, { headers: headers })
            .map((res: response1) => res)
    }


    // to capitalize the text
    capitalize(string) {
        return string.toLowerCase().replace(/^.|\s\S/g, function (a) { return a.toUpperCase(); });
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

                "email_required_message": "Email Address is required",
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
    loaderStatus(status: any) {
        document.getElementById('loader').style['display'] = status;
    }

    // status colors
    getStatusColor(status: any) {
        let statusColor;
        if (status === 'Pending' || status === 'Returned' || status === 'sales manager' ) {
            statusColor = 'warning';
        } else if (status === 'Active' || status === 'Completed' || status === 'OrderPlaced' || status === 'admin' || status === 'Delivered') {
            statusColor = 'success';
        } else if (status === 'Inactive' || status === 'Cancelled' ||status === 'Blocked') {
            statusColor = 'danger';
        } else if (status === 'Request' || status === 'support' || status === 'Processing'|| status === 'Paid') {
            statusColor = 'primary';
        } else if (status === 'OrderDispatched' || status === 'AddToCart'  || status === 'sales representative' || status === 'Shipped' ) {
            statusColor = 'info';
        } else {
            statusColor = 'secondary';
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
            serviceData = moment(field.formatted).format(this.appConfig.dbFormat);
        } else if (field.date) {
            serviceData = moment(field.date).format(this.appConfig.dbFormat);
        } else {
            serviceData = moment(field).format(this.appConfig.dbFormat);
        }
        return serviceData;
    }

    //For Formating Date In EditForm
    getdateFormatinEdit(field) {
        let date;
        date = { date: moment(field).format(this.appConfig.userFormat) };
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

                        if(v == 'dates'){
                            if (filterObj[v].value.length < 9) {
                                return otherFilterCase = true;
                            } 
                            let startDate = moment(filterObj[v].value).format("D/M/YYYY");
                            let endDate = moment(startDate).add(1, 'd').format("D/M/YYYY");
                            criteria.push({ "key": v, "value": startDate, "type": "gteDate" }, { "key": v, "value": startDate, "type": "lteDate" });                                                                                   
                        }
                        // To check length of value in filter
                        if (v == 'created' || v == 'visibleDate' || v == 'expiryDate' ) {
                            if (filterObj[v].value.length < 9) {
                                return otherFilterCase = true;
                            }
                            let startDate = moment(filterObj[v].value).format("YYYY-MM-DD");
                            let endDate = moment(startDate).add(1, 'd').format("YYYY-MM-DD");

                            criteria.push({ "key": v, "value": startDate, "type": "gteDate" }, { "key": v, "value": startDate, "type": "lteDate" });
                        }else if (v == 'inventory.Price' || v == 'amount'|| v == 'currencies.USD'|| v == 'currencies.BUX' ) {
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
                            if (v !== 'created' && v !== 'visibleDate' && v !== 'expiryDate' && v != 'inventory.Price'&&v !='amount' && v != 'dates'&& v !== 'currencies.USD' &&
                             v !== 'currencies.BUX' ) {
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
        if (type && type === 'float') {
            var regex = new RegExp("^[0-9-+().!@#$%*?]");//RegExp("^[0-9-+().!@#$%*?]");
        } else {
            var regex = new RegExp("^[0-9-+().!@#$%*?]");//RegExp("^[0-9-+().!@#$%*?]");//("^[0-9]")
        }


        var key = String.fromCharCode(event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
   
   //To get Value in decimal
    decimalValues(val) {
        return parseFloat(val).toFixed(2);
    }
    // To display toaster messages
    displayToasterMessage(message?: any, tosterType?: any) {
        if (message) {
            if (tosterType) {
                this.toastrService[tosterType](message);
            } else {
                this.toastrService.success(message);
            }
        }
    }

    // To get formatted Date
    getDisplayDateFormat(date?: any, dateFormat?: any) {
        if (date) {
            if (dateFormat) {
                return moment(date).format(dateFormat);
            } else {
                return moment(date).format(this.appConfig.userFormat);
            }
        }
    }


}