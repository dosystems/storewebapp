import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'az-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent {
  users:any=[];
  selectedAttributes:any=[];
  owner:any;
  productForm: FormGroup;
  product: any = {};
  submitted: boolean = false;
  detailsSubmitted: boolean = false;
  categories: any = [];
  inventories: any = [];
  objectKeys = Object.keys;
  attributes: any = [{name:''}];
  images: any = [{ Color: '', images: [] }];
  productId: any;
  disabled: boolean = false;
  selectedCategories: any = [];
  addCategories: any = [{ tree: '', name: '' }];
  addImages: any = [{ uploadImages: [] }];
  colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Purple'];
  categoryValidation: boolean = false;
  inventoriesValidation: boolean = false;
  imagesValidation: boolean = false;
  detailsValidation: boolean = false;
  today: any = new Date;
  brands:any;
  brand:any;

  public startDate: IMyDpOptions = {
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
    disableUntil: { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() - 1 }


  };
  public endDate: IMyDpOptions = {
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



  customStyle = {
    selectButton: {
      "background-color": "transparent",
      "border-radius": "4px",
      "color": "#555"
    },
    clearButton: {
      "background-color": "transparent",
      "border-radius": "25px",
      "color": "#000",
      "margin-left": "10px",
      "display": "none"
    },
    layout: {
      "background-color": "transparent",
      "border-radius": "25px",
      "color": "#FFF",
      "font-size": "15px"
    },
    previewPanel: {
      "background-color": "transparent",
      "border-radius": "0 0 25px 25px"
    }
  }
  constructor(public router: Router, fb: FormBuilder, public appConfig: AppConfig, public appService: AppService, public toastr: ToastrService, public activeRoute: ActivatedRoute) {
    this.getEditor();

    activeRoute.params.subscribe(p => { this.productId = p['id'] });
    if (this.productId) {
      this.getProductById(this.productId);
    }
    this.productForm = fb.group({
      name: ['', Validators.required],
      shortDesc: [''],
      longDesc: [''],
      visibleDate: ['', Validators.required],
      expiryDate: ['', Validators.required]
    });


  }

  // to get the summer note editor

  getEditor() {
    let that = this;
    $(function () {
      $('.summernote').summernote({
        height: 350,
        placeholder: 'Enter description',
        focus: true,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']], // Still buggy
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['view', ['fullscreen', 'codeview']],
          ['help', ['help']],
          ['misc', ['emoji']],
        ]
      });
    });
  }

  // to get Product by Id

  getProductById(id) {
    if (id) {
      this.appService.loaderStatus('block');
      this.appService.manageHttp('get', 'entities/' + id, '').subscribe((res) => {
        if (res && res.details) {
          this.product = res.details;
          if(this.product.ownerName){
           this.owner={displayName:this.product.ownerName};
          }
          if(this.product.brandName){
            this.brand={name:this.product.brandName};
           }
         
          if (this.product.visibleDate) {
            this.product.visibleDate = this.appService.getdateFormatinEdit(this.product.visibleDate);
          }
          if (this.product.expiryDate) {
            this.product.expiryDate = this.appService.getdateFormatinEdit(this.product.expiryDate);
          }
          if (this.product.longDesc) {
            $('#desc .note-editable')[0].innerHTML = this.product.longDesc;
          }
          if (this.product.multipleCategories) {
            this.addCategories = [];
            if (this.product.multipleCategories[0].indexOf(',') > -1) {
              var categories = this.product.multipleCategories[0].split(",");
              for (var i = 0; i < categories.length; i++) {
                this.addCategories.push({ tree: { tree: categories[i] }, 'name': categories[i] });
              }
            } else {
              this.addCategories.push({ tree: { tree: this.product.multipleCategories }, 'name': this.product.multipleCategories });
            }
          }
          if (this.product.inventories && this.product.inventories.length > 0) {
            this.attributes = [];
            this.inventories = [];
            this.inventories = this.product.inventories;
            for (var i = 0; i < this.product.inventories.length; i++) {
              delete this.inventories[i].Available;
              delete this.inventories[i].Hold;
            }
            let keys = Object.keys(this.inventories[0]);
            for (var i = 0; i < keys.length; i++) {
              this.attributes.push({ name: {name:keys[i]} });
            }
          }
          if (this.product.images && this.product.images.length > 0) {
            this.images = this.product.images;
            for (var i = 0; i < this.images.length; i++) {
              for (var j = 0; j < this.images[i].images.length; j++) {
                this.images[i].images[j] = this.appConfig.imageUrl + 'entity/s/' + this.images[i].images[j];
              }
            }
          }
        }
        this.appService.loaderStatus('none');
      });
    }

  }


// to add category
  addCategory() {
    this.addCategories.push({ tree: '', name: '' });
  }
  // to remove category
  removeCategory(i){
    this.addCategories.splice(i,1);
  }
 // to select  category
  selectCategory(event, i) {
    this.categoryValidation=false;
    this.addCategories[i].name = event.name;
  }



  // to remove validation when dates are changed
  onDatesChanged(event) {
  }

  // to add new fetures as keys
  addattribute() {
    this.attributes.push({ name: '' });
  }
// to remove attribute
  removeAttribute(i){
    this.attributes.splice(i,1);
  }

  // on Inventory click
  OnInventoryClick() {
    this.inventoriesValidation=false;
    if (!this.productId) {
      this.inventories = [];
    }
    if (!this.productId) {
      this.attributes.push({ name: {name:'MRP'} },{ name: {name:'Price'} }, { name: {name:'Quantity'} });
      this.addInventory();
    }
  }

  // to add new values as Inventory  for attribute keys
  addInventory() {
    var obj = {};
    for (var i = 0; i < this.attributes.length; i++) {
      if(this.attributes[i].name && this.attributes[i].name.name&& !(this.attributes[i].name.name=='MRP'||this.attributes[i].name.name==''))
      obj[this.attributes[i].name.name] = '';
    }
    this.inventories.push(obj);
  }

  // to add New Images for colors
  addImage() {
    this.images.push({ Color: '', images: [] });
  }

  // on image uplaod Finished to get the Image

  onUploadFinished(image, i) {
    if(i!=0)this.addImages.push({uploadImages:[]});
    this.addImages[i].uploadImages.push({ image });

  }
// to uplaod images
  saveImages(i) {
    // for (var i = 0; i <= this.addImages[i].length; i++) {
    //   this.imageUpload(this.addImages[i].uploadImages, i);
    // }
    this.imageUpload(this.addImages[i].uploadImages, i);
  
  }

// to remove image color section

  removeImageSection(i){
    this.images.splice(i,1);
  }

  // To remove image from selected images
  onRemovedPhoto(image, i) {
    if(image&&image.file&&image.file.name){
      if(this.images[i].images.includes(image.file.name)){
        this.images[i].images.splice(image.file.name, 1);
      } else if(this.addImages[i].uploadImages.length>0){
        for (var j = 0; j <= this.addImages[i].uploadImages.length; j++) {
          if (this.addImages[i].uploadImages[j] && this.addImages[i].uploadImages[j].image && this.addImages[i].uploadImages[j].image.file) {
            let file = this.addImages[i].uploadImages[j].image.file;
            if (file && file.name == image.file.name) {
              this.addImages[i].uploadImages.splice(j, 1);
            }
          }
        }
        
      }
    }
  }

  // to upload images  of product
  imageUpload(images: any, i) {
    this.imagesValidation=false;
    if(!images) return;
    var photoPath = this.appService.multipleFileUpload(images, 'file', 'entities/uploadEntityImages');
    photoPath.subscribe((res) => {
      if (res) {
        var response = res;
      }
      if (response && response.respCode && response.respCode === this.appService.respCode204) {
        this.toastr.success(response.respMessage);
        this.appService.loaderStatus('none');
        let files = response.fileName;
        this.addImages[i].uploadImages = [];
        for (var k = 0; k < files.length; k++) {
          this.images[i].images.push(files[k].name);

        }
       

      } else {
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.appService.loaderStatus('none');
    });
  }






  // to format data  product 
  formatDataOfProduct(product) {
    let Details = product;
    let levels = '';
    if (this.addCategories && this.addCategories.length > 0) {
      for (var i = 0; i < this.addCategories.length; i++) {
        if (this.addCategories[i].tree.tree) {
          if (i > 0) {
            levels += ',';
          }
          levels += this.addCategories[i].tree.tree;

        }
      }
    }

    for (var i = 0; i < this.inventories.length; i++) {
      for (var key in this.inventories[i]) {
        if (typeof (this.inventories[i][key]) == "string")
          this.inventories[i][key] = this.appService.capitalize(this.inventories[i][key]);
      }
    }

    if (this.productId) {
      Details.updatedInventories = this.inventories;
    } else {
      Details.inventories = this.inventories;
    }
    Details.categories = levels;
    for (var i = 0; i < this.images.length; i++) {
      for (var j = 0; j < this.images[i].images.length; j++) {
        if (this.images[i].images[j])
          this.images[i].images[j] = this.images[i].images[j].replace(this.appConfig.imageUrl + 'entity/s/', ' ').trim();

      }
    }
    Details.images = this.images;
    return Details;

  }

  // to save details of product and create or update product of particular Id

  SaveProduct(product,productForm) {
    if(this.addCategories.length>0 && !this.addCategories[0].tree){
      this.categoryValidation=true;
      return;
    }
    if(this.images.length>0&& (this.images[0].Color=='' ||this.images[0].images.length==0)){
      this.imagesValidation=true;
      return;
    }
    if (!productForm.valid ||(!this.owner)) {
      this.detailsSubmitted=true;
      this.detailsValidation=true;
      return;
    }
    if (this.inventories&&
      (this.inventories.length==0 ||(this.inventories.length>1 &&(this.inventories[0].Price==''||this.inventories[0].MRP==''||this.inventories[0].Quantity=='')))) {
      
      this.inventoriesValidation=true;
      return;
    } 
   
    if(productForm.value.visibleDate)
    product.visibleDate = this.appService.getdbFormatDate(productForm.value.visibleDate);
    if(productForm.value.expiryDate)
    product.expiryDate = this.appService.getdbFormatDate(productForm.value.expiryDate);
    product.longDesc = this.appService.formatEditorData($('#desc .note-editable')[0].innerHTML);
    product= this.formatDataOfProduct(product);
     
    this.disabled = true;
    let method;
    let Url;
    if (this.productId) {
      if (product.inventories) {
        delete product.inventories;
      }
      method = 'put'
      Url = 'entities' + '/' + this.productId;
    } else {
      method = 'post'
      Url = 'entities';
    }
      
    if(this.owner){
      product.ownerId = this.owner._id;
      product.ownerName=this.owner.displayName;
    }
    if(this.brand){
      product.brandId = this.brand._id;
      product.brandName=this.brand.name;
    }
    
    this.appService.manageHttp(method, Url, product).subscribe(res => {
      if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
        this.toastr.success(res.respMessage);
        this.router.navigate(['/products']);
        this.disabled = false;
      } else {
        this.disabled = false;
        this.toastr.error(res.respMessage);
        this.appService.loaderStatus('none');
      }
    }, (error) => {
      this.toastr.error('Something Went Wrong');
      this.appService.loaderStatus('none');
    })

  }






  // to get all Categories
  getAllCategories(event: any) {
    if (event && event.query) {
      var URL = 'categories?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
      this.appService.manageHttp('get', URL, '').subscribe((res) => {
        if (res) {
          this.categories = res.categories;
        } else {
          this.categories = [];
        }
      });
    }
  }


    // to search attibutes of name
    searchAttributes(event: any) {
      if (event && event.query) {
        var URL = 'attributes?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
        this.appService.manageHttp('get', URL, '').subscribe((res) => {
          if (res) {
            this.selectedAttributes = res.attributes;
          } else {
            this.selectedAttributes = [];
          }
        });
      }
    }



    // to search owners
    searchOwners(event){
      if (event && event.query) {
        var URL = 'sellers?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "displayName", "value": "' + event.query + '", "type": "regexOr"}]}';
        this.appService.manageHttp('get', URL, '').subscribe((res) => {
          if (res) {
            this.users = res.sellers;
          } else {
            this.users = [];
          }
        });
      }
    }


    // to search owners
    searchBrands(event){
      if (event && event.query) {
        var URL = 'brands?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
        this.appService.manageHttp('get', URL, '').subscribe((res) => {
          if (res) {
            this.brands = res.brands;
          } else {
            this.brands = [];
          }
        });
      }
    }

  //Function to set disabledate field disabling dates before selected visible date
  onStartDateChanged(event: IMyDateModel) {
    let d: Date = new Date(event.jsdate.getTime());

    // set previous of selected date
    d.setDate(d.getDate() - 1);

    // Get new copy of options in order the date picker detect change
    let copy: IMyDpOptions = this.getCopyOfEndDateOptions();
    copy.disableUntil = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    };
    this.endDate = copy;

  }

  // to pass the disabling dates
  getCopyOfEndDateOptions(): IMyDpOptions {
    return JSON.parse(JSON.stringify(this.endDate));
  }


}
