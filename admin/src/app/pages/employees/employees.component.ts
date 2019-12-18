import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { emailValidator ,passwordValidator ,phoneValidator} from '../../validators';
declare var $: any;


@Component({
  selector: 'az-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  providers: [AppService]
})
export class EmployeesComponent implements OnInit {
  employeeForm: FormGroup;
  serverUrl  = 'employees';
  pageNumber: any;
  totalRecords: any;
  submitted: boolean;
  employeeId: any;
  employeeData: any = {};
  address: any = {};
  employeeList: any = [];
  columns: any = [];
  genderStatus: any = [];
  employeeStatus: any = [];
  Roles :any =[];
  mobnumPattern = '^((\\+91-?)|0)?[0-9]{10}$';
  
  constructor(fb: FormBuilder, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.employeeForm = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber:['' ,Validators.required ],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['' ],
      address1: [''],
      role :['', Validators.required]
    });

  }

  ngOnInit() {
    this.columns = [
      { header: 'FirstName', field: 'firstName' },
      { header: 'DisplayName', field: 'displayName' },
      { header: 'LastName', field: 'lastName' },
      { header: 'Phone', field: 'phoneNumber' },
      { header: 'Email', field: 'email' },
      { header: 'Address', field: 'address.address' },
      { header: 'Role', field: 'role' },
      { header: 'Status', field: 'status' },
      { header: 'Created', field: 'created' },
      { header: 'CreatedBy', field: 'createdBy.employee.displayName' }  
    ];
    this.genderStatus = [
      { label: 'All', value: null },
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
    ];

    this.employeeStatus = [
      { label: 'All', value: null },
      { label: 'Active', value: 'Active' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Inactive', value: 'Inactive' }
    ];
    this.Roles = [
      { label:'Select Role' , value:null },
      { label:'Super Admin' , value:'Super Admin' },
      { label:'Admin' , value:'Admin' },
      { label:'Sales Manager' , value:'Sales Manager' },
      { label:'Sales Rep' , value:'Sales Representative' },
      { label:'Support' , value:'Support' }
    ]
  }

  //  Function to get all employees list

  getAllEmployees(event?: any) {
    let filterCriteria;
      let filterLabels = ['firstName', 'lastName', 'email', 'phoneNumber', 'address.address', 'gender', 'status','role' ];
      filterCriteria = this.appService.EventData(event,filterLabels);
      if(filterCriteria == 'invalidData'){
        return;
      }

    if (!filterCriteria) {
        return;
    }
    let URL = this.serverUrl +  '?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res) {
        this.employeeList = res.employees;
        for (let i = 0; i < this.employeeList.length; i++) {
         if(event && event.first){
           this.employeeList[i].srNo = (i + 1) + event.first;
         }
         else{
           this.employeeList[i].srNo = i+1;
         }
        }
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
        } 
        this.appService.loaderStatus('none');
      } else {
        this.employeeList = [];
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
       this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })

  }


  //  Function for create or update based on submit button.

  createOrUpdateEmployee(employeeForm) {
    if (employeeForm.status === 'INVALID') {
      this.submitted = true;
      return;
    }
    let method;
    let Url;
    if (this.employeeData._id) {
      method = 'put'
      Url = this.serverUrl + '/' + this.employeeData._id;
    } else {
      method = 'post'
      Url = this.serverUrl;
    }
    employeeForm.value.firstName = this.appService.capitalize(employeeForm.value.firstName);
    employeeForm.value.lastName = this.appService.capitalize(employeeForm.value.lastName);
    employeeForm.value.address = {};
    employeeForm.value.address.address = this.appService.capitalize(employeeForm.value.address1);;
    delete employeeForm.value.address1;    
    this.appService.manageHttp(method, Url, employeeForm.value).subscribe(res => {
      if (res && res.respMessage) {
        this.appService.displayToasterMessage(res.respMessage);
        this.getAllEmployees();
        $('#addOrEdit').modal('hide');
        this.appService.loaderStatus('none');
      } else if(res && res.errorMessage){
        this.appService.loaderStatus('none');
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
      this.appService.loaderStatus('none');
       this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
  }

  //  Function for onClickAction on add, edit, update and delete

  onClickAction(type, empRowData?: any) {
    if (type === 'add') {
      this.employeeData = {};
      this.submitted = false;
      this.employeeForm.reset();
      $('#addOrEdit').modal({ backdrop: 'static', keyboard: false }, 'show');
    } else {      
      this.employeeData = JSON.parse(JSON.stringify(empRowData));
      if (this.employeeData.address) {
        if (this.employeeData.address.address) {
          this.employeeData.address1 = this.employeeData.address.address;
        }
      }
      if (type === 'edit') {
        $('#addOrEdit').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else if (type === 'view') {
        $('#viewEmployee').modal({ backdrop: 'static', keyboard: false }, 'show');
      } else if (type === 'delete') {
        this.employeeId = empRowData._id;
        $('#deleteEmployee').modal('show');
      }
    }
  }

  // Function to delete employee record
  deleteEmployee() {
    this.appService.manageHttp('delete', this.serverUrl + '/' + this.employeeId, '').subscribe(res => {
      if (res && res.respCode === 206) {
        $('#deleteEmployee').modal('hide');
        this.toastr.success(res.respMessage);
        this.getAllEmployees();
      } else if (res && res.respCode === 9001) {
        this.appService.displayToasterMessage(res.errorMessage);
      }
    }, (error) => {
       this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
    })
  }


}
