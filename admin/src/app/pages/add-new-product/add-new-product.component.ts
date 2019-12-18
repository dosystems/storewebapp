import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
declare var $: any;

@Component({
    selector: 'az-add-new-product',
    templateUrl: './add-new-product.component.html',
    styleUrls: ['./add-new-product.component.scss']
})
export class AddNewProductComponent implements OnInit {
    allCategories: any = [];
    categories: any = [{ tree: '', name: '' }];

    merchantDetails: any = {};
    brandDetails: any = {};

    merchants: any = [];

    brands: any = [];
    countries: any;

    images: any = [{ Color: '', images: [] }];
    addImages: any = [{ uploadImages: [] }];
    colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Purple'];

    allAttributes: any = [];
    attributes: any = [{ name: '' }];

    allinventroies: any = [];
    inventories: any = [];
    inventorySectionValidation: boolean = false;

    productForm: FormGroup;
    addressForm: FormGroup;
    productData: any = {};
    addressData: any = {};
    submitted: boolean = false;
    product: any = {};
    productId: any;
    disabled: boolean = false;
    defaultInventoryOptions: any = ['MRP', 'Price', 'Quantity', 'Wt(Lbs)', 'Ht(in)', 'L(in)', 'W(in)'];
    copyProductId: any;
    address: any = {};
    supportCountries: any = [];
    multiSelectCountries: any = [];
    Refundable: boolean = true;
    DefaultPolicy: any;
    countryValidation: boolean = false;
    // For image upload styles
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

    constructor(public appService: AppService, fb: FormBuilder, public appConfig: AppConfig, public router: Router, public activeRoute: ActivatedRoute) {
        this.attributes.push(
            { name: { name: 'MRP' }, dafaultInventory: true },
            { name: { name: 'Price' }, dafaultInventory: true },
            { name: { name: 'Quantity' }, dafaultInventory: true },
            { name: { name: 'Wt(Lbs)' }, dafaultInventory: true },
            { name: { name: 'Ht(in)' }, dafaultInventory: true },
            { name: { name: 'L(in)' }, dafaultInventory: true },
            { name: { name: 'W(in)' }, dafaultInventory: true }
        );

        this.productForm = fb.group({
            name: ['', Validators.required],
            euroPercentage: ['', Validators.required],
            buxPercentage: ['', Validators.required],
            shortDesc: [''],
            longDesc: [''],
            visibleDate: ['', Validators.required],
            expiryDate: ['', Validators.required]
        });

        this.addressForm = fb.group({
            street: ['', Validators.required],
            city: ['', Validators.required],
            state: ['', Validators.required],
            country: ['', Validators.required],
            zip: ['', Validators.required],
            name: ['', Validators.required],
            phone: ['', Validators.required]
        });
        this.getSettings();
        this.CountriesForMultiSelect();
        activeRoute.params.subscribe(p => { this.productId = p['productId'] });

        activeRoute.params.subscribe(p => { this.copyProductId = p['copyProductId'] });

        if (this.productId || this.copyProductId) {
            let productId;
            if (this.productId) {
                productId = this.productId;
            } else if (this.copyProductId) {
                productId = this.copyProductId;
            }
            this.getProductById(productId);
        }
    }

    ngOnInit() {
        // to get the summer note editor
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

    // to get all Categories
    getAllCategories(event?: any) {
        if (event && event.query) {
            var URL = 'categories?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "tree", "value": "' + event.query + '", "type": "regexOr"}]}';
            this.appService.manageHttp('get', URL, '').subscribe((res) => {
                if (res && res.categories && res.categories.length && res.categories.length > 0) {
                    this.allCategories = res.categories;
                } else {
                    this.allCategories = [];
                }
            });
        }
    }

    // on select  category
    selectCategory(event, category) {
        if (event && event.name) {
            category.name = event.name;
        } else {
            category.name = '';
        }
    }

    // on click add category
    addNewCategory() {
        this.categories.push({ tree: '', name: '' });
    }

    // on click remove category
    removeCategory(i) {
        if (this.categories && this.categories.length && this.categories.length === 1) {
            return;
        } else {
            this.categories.splice(i, 1);
        }
    }


    // to search merchants
    searchMerchants(event) {
        if (event && event.query) {
            var URL = 'sellers?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "companyName", "value": "' + event.query + '", "type": "regexOr"}]}';
            this.appService.manageHttp('get', URL, '').subscribe((res) => {
                if (res && res.sellers && res.sellers.length && res.sellers.length > 0) {
                    this.merchants = res.sellers;

                } else {
                    this.merchants = [];
                }
            });
        }
    }

    // to search brands
    searchBrands(event) {
        if (event && event.query) {
            var URL = 'brands?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
            this.appService.manageHttp('get', URL, '').subscribe((res) => {
                if (res && res.brands && res.brands.length && res.brands.length > 0) {
                    this.brands = res.brands;
                } else {
                    this.brands = [];
                }
            });
        }
    }

    // to add New Images for colors
    addImage() {
        this.images.push({ Color: '', images: [] });
    }

    // on image uplaod Finished to get the Image

    onUploadFinished(image, i) {
        if (i != 0) {
            this.addImages.push({ uploadImages: [] });
        }
        this.addImages[i].uploadImages.push({ image });

    }
    // to uplaod images
    saveImages(i) {
        this.imageUpload(this.addImages[i].uploadImages, i);
    }

    // to remove image color section

    removeImageSection(i) {
        if (this.images.length === 1) {
            return
        }
        this.images.splice(i, 1);
    }

    // To remove image from selected images
    onRemovedPhoto(image, i) {
        if (image && image.file && image.file.name) {
            if (this.images[i].images.includes(image.file.name)) {
                this.images[i].images.splice(image.file.name, 1);
            } else if (this.addImages[i].uploadImages.length > 0) {
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
        if (images && images.length && images.length > 0) {
            let photoPath = this.appService.multipleFileUpload(images, 'file', 'entities/uploadEntityImages');
            photoPath.subscribe((response) => {
                if (response && response.respCode && response.respCode === this.appService.respCode204) {
                    this.appService.displayToasterMessage(response.respMessage);
                    this.appService.loaderStatus('none');
                    let files = response.fileName;
                    this.addImages[i].uploadImages = [];

                    files.forEach(file => {
                        this.images[i].images.push(file.name);
                    });
                } else {
                    this.appService.loaderStatus('none');
                }
            }, (error) => {
                this.appService.loaderStatus('none');
                this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
            });
        } else {
            return
        }
    }


    // to search attibutes of name
    searchAttributes(event: any) {
        if (event && event.query) {
            var URL = 'attributes?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
            this.appService.manageHttp('get', URL, '').subscribe((res) => {
                if (res && res.attributes && res.attributes.length && res.attributes.length > 0) {
                    this.allAttributes = res.attributes;
                } else {
                    this.allAttributes = [];
                }
            });
        }
    }

    // to add new fetures as keys
    addattribute() {
        this.attributes.push({ name: '' });
    }
    // to remove attribute
    removeAttribute(i) {
        if (this.attributes.length === 1) {
            return
        }
        this.attributes.splice(i, 1);
    }

    // to remove inventory
    removeInventory(index) {
        if (this.inventories.length === 1) {
            return
        }
        this.inventories.splice(index, 1);
    }


    // on Inventory click
    OnInventoryClick() {
        if (!this.productId) {
            this.inventories = [];
            this.addInventory();
        }
    }

    // to add new values as Inventory  for attribute keys
    addInventory() {
        var obj = {};
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name && this.attributes[i].name.name) {
                obj[this.attributes[i].name.name] = '';
            }
        }
        this.inventories.push(obj);
    }

    // To prepare product data section
    prepareProductDataSection(productForm?: any) {
        // To assign merchant and brand details
        if (this.merchantDetails) {
            this.productData.ownerId = this.merchantDetails._id;
            this.productData.ownerName = this.merchantDetails.companyName;
        }
        if (this.brandDetails) {
            this.productData.brandId = this.brandDetails._id;
            this.productData.brandName = this.brandDetails.name;
        }
        if (this.addressData) {
            this.productData.address = this.addressData;
        }
        if (this.supportCountries) {
            this.productData.availableCountries = this.supportCountries;
        }
        if (this.Refundable) {
            this.productData.isReturnable = this.Refundable;
        } else {
            this.productData.isReturnable = false;
        }

        // Prepare category section
        if (this.categories && this.categories.length > 0) {
            let selectedCategory = '';
            this.categories.forEach((category, index) => {
                if (category.tree.tree) {
                    if (index > 0) {
                        selectedCategory += ','
                    }
                    selectedCategory += category.tree.tree;
                }
            });
            this.productData.categories = selectedCategory;
        }
        // Prepare images section
        // console.log(this.images);
        // this.images.forEach(image => {
        //     console.log(image);
        //     image.images.forEach(signleImage => {
        //         console.log(signleImage)
        //         if (signleImage) {
        //           console.log(signleImage)
        //             signleImage = signleImage.replace(this.appConfig.imageUrl + 'entity/s/', ' ').trim();
        //         }
        //         console.log(signleImage)

        //     });
        // });
        for (let i = 0; i < this.images.length; i++) {
            for (let j = 0; j < this.images[i].images.length; j++) {
                if (this.images[i].images[j])
                    this.images[i].images[j] = this.images[i].images[j].replace(this.appConfig.imageUrl + 'entity/s/', ' ').trim();

            }
        }

        this.productData.images = this.images;

        // Prepare inventries section
        for (var i = 0; i < this.inventories.length; i++) {
            for (var key in this.inventories[i]) {
                if (typeof (this.inventories[i][key]) == "string" && this.inventories[i][key])
                    this.inventories[i][key] = this.appService.capitalize(this.inventories[i][key]);
            }
        }
        if (this.inventories.length == 0) {
            this.inventorySectionValidation = true;
        } else {
            this.inventorySectionValidation = false;
        }
        this.inventories.forEach(inventory => {
            let keyValuePairs = Object.entries(inventory);
            keyValuePairs.forEach((keyValuePair, index) => {
                if (keyValuePair[0] && keyValuePair[0] == 'MRP' || keyValuePair[0] == 'Price' || keyValuePair[0] == 'Quantity') {
                    if (!keyValuePair[1]) {
                        this.inventorySectionValidation = true;
                    }
                }
            });
        });

        // For checking validation based on selected attributes
        this.attributes.forEach(attribute => {
            if (attribute && attribute.name && attribute.name.name && !attribute.dafaultInventory) {
                this.inventories.forEach(inventory => {
                    if (!inventory.hasOwnProperty(attribute.name.name)
                        || (inventory.hasOwnProperty(attribute.name.name) && !inventory[attribute.name.name])) {
                        this.inventorySectionValidation = true;
                    }
                });
            }
        });

        if (this.productId) {
            this.productData.updatedInventories = this.inventories;
        } else {
            this.productData.inventories = this.inventories;
        }

        // prepare general info section assign form values into object
        if (productForm.value && productForm.value.visibleDate) {
            this.productData.visibleDate = this.appService.getdbFormatDate(productForm.value.visibleDate);
        }
        if (productForm.value && productForm.value.expiryDate) {
            this.productData.expiryDate = this.appService.getdbFormatDate(productForm.value.expiryDate);
        }

        if (productForm.value && productForm.value.name) {
            this.productData.name = this.appService.capitalize(productForm.value.name);
        }

        if (productForm.value && productForm.value.buxPercentage) {
            this.productData.buxPercentage = Number(productForm.value.buxPercentage);
        }

        if (productForm.value && productForm.value.euroPercentage) {
            this.productData.euroPercentage = Number(productForm.value.euroPercentage);
        }

        if (productForm.value && productForm.value.shortDesc) {
            this.productData.shortDesc = productForm.value.shortDesc;
        }

        this.productData.longDesc = this.appService.formatEditorData($('#desc .note-editable')[0].innerHTML);
        this.productData.privacyPolicy = this.appService.formatEditorData($('#policy .note-editable')[0].innerHTML);
    }

    // To save or update product 
    saveOrUpdateProduct(productForm?: any) {
        // console.log(this.addressData);
        this.prepareProductDataSection(productForm);

        if (productForm.invalid || this.addressForm.status == 'INVALID'
            || !this.productData.ownerId
            || !this.productData.brandId
            || !this.productData.categories
            || (this.productData.availableCountries.length == 0 || this.productData.availableCountries.length < 1)
            || this.addressForm.invalid
            || this.inventorySectionValidation
            || (this.productData.images.length > 0
                && (this.productData.images[0].Color == ''
                    || this.productData.images[0].images.length == 0))) {
            this.submitted = true;
            return
        } else {
            let method, Url;
            if (this.addressForm && this.addressForm.value) {
                this.productData.address = {};
                for (var details in this.addressForm.value) {
                    if (details == 'country') {
                        if (this.addressForm.value[details].name) {
                            this.productData.address['country'] = this.addressForm.value[details].name;
                        } else if (this.address.country.name) {
                            this.productData.address['country'] = this.address.country.name;
                        }
                        else {
                            this.countryValidation = true;
                            this.submitted = true;
                            return;
                        }
                        if (this.addressForm.value[details].countryCode) {
                            this.productData.address['countryCode'] = this.addressForm.value[details].countryCode;
                        } else {
                            this.productData.address['countryCode'] = this.address.countryCode;
                        }
                    } else {
                        this.productData.address[details] = this.addressForm.value[details];
                    }



                }


            }

            if (this.productId) {
                if (this.productData.inventories) {
                    delete this.productData.inventories;
                }
                method = 'put'
                Url = 'entities' + '/' + this.productId;
            } else {
                method = 'post'
                Url = 'entities';
            }
            this.disabled = true;
            this.appService.manageHttp(method, Url, this.productData).subscribe(res => {
                if (res && res.respCode == this.appService.respCode204 || res.respCode == this.appService.respCode205) {
                    this.appService.displayToasterMessage(res.respMessage);
                    this.router.navigate(['/products']);
                    this.disabled = false;
                } else {
                    this.disabled = false;
                    this.appService.displayToasterMessage(res.respMessage, 'error');
                    this.appService.loaderStatus('none');
                }
            }, (error) => {
                this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
                this.appService.loaderStatus('none');
                this.disabled = false;
            })
        }

    }

    // To get product details based on id
    getProductById(productId) {
        this.Refundable = null;
        this.appService.loaderStatus('block');
        this.appService.manageHttp('get', 'entities/' + productId, '').subscribe((res) => {
            if (res && res.details) {
                this.product = res.details;
                if (this.product.availableCountries) {
                    this.supportCountries = this.product.availableCountries;
                }
                if (this.product.isReturnable) {
                    this.Refundable = this.product.isReturnable;
                }
                if (this.product.ownerName) {
                    this.merchantDetails = { companyName: this.product.ownerName, _id: this.product.ownerId };
                }
                if (this.product.brandName) {
                    this.brandDetails = { name: this.product.brandName, _id: this.product.brandId };
                }
                if (this.product.address) {
                    this.addressData = this.product.address;
                }
                if (this.product.multipleCategories) {
                    this.categories = [];
                    if (this.product.multipleCategories[0].indexOf(',') > -1) {
                        var categories = this.product.multipleCategories[0].split(",");
                        for (var i = 0; i < categories.length; i++) {
                            this.categories.push({ tree: { tree: categories[i] }, 'name': categories[i] });
                        }
                    } else {
                        for (var i = 0; i < this.product.multipleCategories.length; i++) {
                            this.categories.push({ tree: { tree: this.product.multipleCategories[i] }, 'name': this.product.multipleCategories[i] });
                        }
                    }
                }


                if (this.product.longDesc) {
                    if ($('#desc .note-editable')[0] && $('#desc .note-editable')[0].innerHTML)
                        $('#desc .note-editable')[0].innerHTML = this.product.longDesc;
                }
                if (this.product.privacyPolicy) {
                    if ($('#policy .note-editable')[0] && $('#policy .note-editable')[0].innerHTML)
                        $('#policy .note-editable')[0].innerHTML = this.product.privacyPolicy;
                }
                // For copying product don't assign dates,images,inventries
                if (this.productId) {
                    if (this.product.visibleDate) {
                        this.product.visibleDate = this.appService.getdateFormatinEdit(this.product.visibleDate);
                    }
                    if (this.product.expiryDate) {
                        this.product.expiryDate = this.appService.getdateFormatinEdit(this.product.expiryDate);
                    }
                    if (this.product.inventories && this.product.inventories.length > 0) {
                        this.attributes = [];
                        this.inventories = [];
                        this.inventories = this.product.inventories;
                        for (var i = 0; i < this.product.inventories.length; i++) {
                            delete this.inventories[i].Available;
                            delete this.inventories[i].Hold;
                            delete this.inventories[i].MRPCurrency;
                            delete this.inventories[i].Currency;
                            delete  this.inventories[i]['adminCommissionPercentage'];
                            delete  this.inventories[i]['adminCommission'];
                        }
                        let keys = Object.keys(this.inventories[0]);
                        for (var i = 0; i < keys.length; i++) {
                            if (this.defaultInventoryOptions.includes(keys[i])) {
                                this.attributes.push({ name: { name: keys[i] }, dafaultInventory: true });
                            } else {
                                this.attributes.push({ name: { name: keys[i] } });
                            }
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
                    if (this.product.address) {
                        this.address = this.product.address;
                        this.address.country = { name: this.address.country, countryCode: this.address.countryCode }
                    }
                } else {
                    this.product.visibleDate = '';
                    this.product.expiryDate = '';
                }
            }
            this.appService.loaderStatus('none');
        });

    }

    //get COuntries For AddressForm


    // to get all Countries
    getCountriesList(event: any) {
        this.submitted = false;
        this.countryValidation = false;
        if (event && event.query) {
            var URL = 'countries?filter={"sortfield":"created","direction":"desc","criteria":[{ "key": "name", "value": "' + event.query + '", "type": "regexOr"}]}';
            this.appService.manageHttp('get', URL, '').subscribe((res) => {
                if (res) {
                    this.countries = res.countrys;
                } else {
                    this.countries = [];
                }
            });
        }
    }

    onClickUseAddress() {
        if (this.merchantDetails._id) {
            if (this.merchantDetails.address) {
                this.address = this.merchantDetails.address;
                if (this.address.country && !this.address.country.name) {
                    this.address.country = { "name": this.address.country };
                }
            } else {
                this.appService.displayToasterMessage("Vendor address not available", 'error');
            }
        } else {
            this.appService.displayToasterMessage("please select vendor", 'error');
        }

    }


    //get COuntries list for multiselect CountriesForMultiSelect
    CountriesForMultiSelect() {
        this.appService.manageHttp('get', 'countries', '').subscribe(res => {
            if (res && res.countrys && res.countrys.length && res.countrys.length > 0) {
                var allcountries = res.countrys;
                for (let i = 0; i < allcountries.length; i++) {
                    this.multiSelectCountries.push({ label: allcountries[i].name, value: allcountries[i].countryCode })
                }
            }
        });
    }

    // Directly Assigning Privacy Policy
    getSettings() {

        let URL;
        let filterCriteria = { "limit": 20, "sortfield": "created", "direction": "desc", "criteria": [{ "key": "role", "value": "Super Admin", "type": "in" }] };
        URL = 'settings/' + '?filter=' + JSON.stringify(filterCriteria);
        this.appService.loaderStatus('block');
        this.appService.manageHttp('get', URL, '').subscribe(res => {
            if (res && res.settings && res.settings.length) {
                this.DefaultPolicy = res.settings[0].privacyPolicy;
                if ($('#policy .note-editable')[0] && $('#policy .note-editable')[0].innerHTML)
                    $('#policy .note-editable')[0].innerHTML = this.DefaultPolicy;
                this.appService.loaderStatus('none');
            } else {
                this.DefaultPolicy = '';
                this.appService.loaderStatus('none');
                this.appService.displayToasterMessage(res.errorMessage);
            }
        }, (error) => {
            this.appService.loaderStatus('none');
            this.appService.displayToasterMessage(this.appService.serverErrorMessage, 'error');
        });
    }

}
