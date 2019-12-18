import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import '../../assets/js/countdown/jquery.countdown.min.js';
import '../../assets/js/bootstrap.min.js';
import { AppConfig } from '../app.config';
import { NavbarService } from '../navbar.service';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment/moment';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
declare var $;
@Component({
  selector: 'ross-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  totalProducts: any = [];
  totalRecords: any;
  pages: Number;
  pageNumber: any = 1;
  allCategories: any = [];
  paths: any;
  menu: any = [];
  noProducts: boolean = false;
  filterCriteria: any;
  selectedColors: any = [];
  brands: any = [];
  selectedBrands: any = [];
  rangeValues: any = [];
  priceRange = false;
  showLatestTrending: boolean = false;
  productsLimit: any;
  paramSearch: any;
  prices = ['Under 500', '500-1000', '1000-2500', '2500-5000', 'Over 5000'];
  colors = [{ color: 'red', active: false }, { color: 'pink', active: false }, { color: 'violet', active: false }, { color: 'blue', active: false },
  { color: 'marine', active: false }, { color: 'orange', active: false },
  { color: 'yellow', active: false }, { color: 'darkyellow', active: false }, { color: 'black', active: false }, { color: 'white', active: false }
  ];
  @HostListener('window:resize') onResize() {
    // guard against resize before view is rendered
    this.resize();
  }
  constructor(public route: ActivatedRoute, public router: Router, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService, public NavService: NavbarService) {
    this.getAllCategories();
    this.getAllBrands();
    route.params.subscribe(params => {
      this.paramSearch = params['search'];
      this.getAllProducts();
    });
    if (!this.paramSearch) {
      this.getAllProducts('', 'list');
    }
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        if (this.router.url == '/products') {
          this.router.navigated = false;
          window.scrollTo(0, 0);
        }
      }
    });

    //Accesing navbar service
    this.NavService.componentMethodCalled$.subscribe(
      () => {
        this.getAllProducts();
      }
    );
  }

  ngOnInit() {
    window.scroll(0, 0);

  }
  async ngAfterViewInit() {
    await setTimeout(() => {    //<<<---    using ()=> syntax
      this.viewMode('.grid-view');
      this.appConfig.loadScript('../../assets/js/app.js');
      this.resize();
    }, 1000);
  }
  arrangeFilterData(action?: any) {
    this.pageNumber = 1;
    this.pages = 0;
    let data: any = {};
    if (action == 'priceLowToHigh' || action == 'dateOldToNew' || action == 'nameAsc') {
      data.direction = 'asc';
    } else if (action == 'priceHighToLow' || action == 'dateNewToOld' || action == 'nameDesc') {
      data.direction = 'desc';
    } else {
      data.direction = this.filterCriteria['direction'];
    }

    if (action.includes('price')) {
      data.sortField = 'inventories.Price';
    } else if (action.includes('nameAsc') || action.includes('nameDesc')) {
      data.sortField = 'name';
    }
    else if (action.includes('date')) {
      data.sortField = 'created';
    } else {
      data.sortField = this.filterCriteria['sortfield'];
    }

    let filterCriteria = {};
    filterCriteria['page'] = this.pageNumber;
    if (Number(action)) {
      this.productsLimit = Number(action);
      filterCriteria['limit'] = Number(action);
    } else {
      this.productsLimit = this.appConfig.productsPerPage;
      filterCriteria['limit'] = this.appConfig.productsPerPage;
    }
    filterCriteria['sortfield'] = data.sortField;
    filterCriteria['direction'] = data.direction;

    this.getAllProducts('', '', filterCriteria);
  }

  //For Getting All the Products 
  getAllProducts(data?: any, type?: any, filterData?: any) {
    let URL;
    let filterCriteria: any = {};
    let criteria = [];
    if (filterData) {
      filterData['globalSearch'] = this.filterCriteria['globalSearch'];
      filterCriteria = filterData;
    } else {
      if (!this.productsLimit) this.productsLimit = this.appConfig.productsPerPage;
      if (type == 'list') {
        filterCriteria = { "page": this.pageNumber, "limit": this.productsLimit };

        if (!filterCriteria['sortfield']) {
          filterCriteria['sortfield'] = 'created';
        }
        if (!filterCriteria['direction']) {
          filterCriteria['direction'] = 'desc';
        }
        // to get search data from navbar 
      } else {
        let search = '';
        if (type == 'menu' && data) {
          if (data.tree && (data.tree != '')) {
            search = data.tree;
          }
          if (search != '') {
            search += '-';
          }
          if (data.title) {
            search += data.title;
          }
        } else {
          if (data) {
            search = data;
          }
          else {
            search = localStorage.getItem('Search');
          }
        }
        filterCriteria = { "page": this.pageNumber, "limit": this.productsLimit, "sortfield": "created", "direction": "desc" };

        if (search || this.paramSearch) {
          let searchData;
          if (this.paramSearch) searchData = this.paramSearch;
          if (search) searchData = search;
          // to replace & symbol with and
          if (searchData.indexOf('&') > -1) {
            searchData = searchData.replace(/&/g, "and");
          }
          filterCriteria['globalSearch'] = { "value": searchData.trim(), "type": "user" };
        }
      }
    }
    filterCriteria['criteria'] = [];
    if (this.selectedColors && this.selectedColors.length > 0) {
      filterCriteria['criteria'].push({ "key": "inventories.Color", "value": this.selectedColors, "type": "in" });
    }
    if (this.selectedBrands && this.selectedBrands.length > 0) {
      filterCriteria['criteria'].push({ "key": "brandName", "value": this.selectedBrands, "type": "in" });
    }

    if (this.priceRange) {
      if (this.rangeValues && this.rangeValues[0]) {
        filterCriteria['criteria'].push({ "key": "inventories.Price", "value": this.rangeValues[0], "type": "gte" });
      }
      if (this.rangeValues && this.rangeValues[1]) {
        filterCriteria['criteria'].push({ "key": "inventories.Price", "value": this.rangeValues[1], "type": "lte" });
      }
    }
    this.filterCriteria = filterCriteria;
    URL = 'entities?filter=' + JSON.stringify(filterCriteria);
    this.appService.loaderStatus('block');
    this.appService.manageHttp('get', URL, '').subscribe(res => {
      if (res.entities && res.entities.length > 0) {
        this.totalProducts = res.entities;
        window.scrollTo(0, 0);
        this.totalProducts.forEach(product => {
          if (product.inventories && product.inventories[0] && product.inventories[0].Price) {
            product.price = product.inventories[0].Price;
          }
          if (product.rating && product.rating.rating) {
            product.reviews = product.rating.rating;
          }
          if (product.inventories[0].Price && product.inventories[0].MRP) {
            product.savePercentage = (((product.inventories[0].MRP - product.inventories[0].Price) / product.inventories[0].MRP) * 100).toFixed(2);
            product.savePercentage=parseInt(product.savePercentage);
          }
         
          product.productId = product._id;
          product.showNewLabel = true;
          let showDate = moment(product.created).add(this.appConfig.showDaysOfNewLabel, 'day').format(this.appConfig.userFormat);
          let now = moment().format(this.appConfig.userFormat);
          if (now&&showDate&&now > showDate) {
            product.showNewLabel = false;
          }
        });
        this.noProducts = false;
        if (res.pagination.totalCount) {
          this.totalRecords = res.pagination.totalCount;
          this.pages = Math.ceil(this.totalRecords / this.filterCriteria['limit']);
        }
        this.appService.loaderStatus('none');
      } else {
        window.scrollTo(0, 0);
        this.noProducts = true;
        this.totalProducts = [];
        this.appService.loaderStatus('none');
      }
      if (localStorage.getItem('Search')) localStorage.removeItem('Search');
      this.showLatestTrending = true;
    }, (error) => {
      this.totalProducts = [];
      this.toastr.error('something went wrong');
      this.appService.loaderStatus('none');
    });
  }



  // on page change
  paginate(event) {
    this.pageNumber = event.page + 1;
    if (this.filterCriteria) {
      this.filterCriteria['page'] = this.pageNumber;
      this.filterCriteria['limit'] = this.productsLimit;
    }
    this.getAllProducts('', '', this.filterCriteria);
  }



  // Function to get all categories

  getAllCategories() {
    this.appService.manageHttp('get', 'categories', '').subscribe(async res => {
      if (res && res.categories && res.categories.length && res.categories.length > 0) {
        this.allCategories = res.categories;
        this.allCategories.sort(function (a, b) {
          return +(a.tree > b.tree) || +(a.tree === b.tree) - 1;
        });
        await this.getPaths();
        await this.createMenuArray(this.menu, this.paths.subpaths, '');
      } else {
        this.menu = [];
      }
      if (this.menu && this.menu.length > 0) {
        this.menu.sort(function (c, d) {
          return +(c.count > d.count) || +(c.count === d.count) - 1;
        });
        this.menu.reverse();
      }
    })
  }

  // functions to get paths and subpaths object from tree

  getPaths() {
    this.paths = this.allCategories.reduce((carry, pathEntry) => {

      // On every path entry, resolve using the base object
      this.resolvePath(carry, pathEntry.tree);
      // Return the base object for suceeding paths, or for our final value
      return carry;
      // Create our base object
    }, this.createPath(''));

  }

  createPath(tree) {
    var tree1 = (' ' + tree).slice(1);
    return {
      subpaths: {}, tree: tree1
    };
  }

  // Resolves the path into objects iteratively (but looks eerily like recursion).
  resolvePath(root, path) {
    path.split('-').reduce((pathObject, pathName) => {
      var path1 = (' ' + path).slice(1);
      // For each path name we come across, use the existing or create a subpath
      pathObject.subpaths[pathName] = pathObject.subpaths[pathName] || this.createPath(path1);
      // Then return that subpath for the next operation
      return pathObject.subpaths[pathName];
      // Use the passed in base object to attach our resolutions
    }, root);
  }

  // Function to make paths object into an iterable array

  async createMenuArray(array, obj, path) {
    for (let prop in obj) {
      let result = [];
      result = this.allCategories.filter(function (cat) {
        return cat.name == prop;
      });
      let count = 0;
      if(result && result.length > 0 && result[0] && result[0].count){
        count = result[0].count;
        result.forEach(res => {
          if(res.tree===path+'-'+prop){
            count=res.count;
          }
        });
      }
      array.push({ title: prop, id: Math.floor((Math.random() * 1000) + 1), subpath: [], count: count, tree: path })

    }
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i].title].subpaths) {
        await this.createMenuArray(array[i].subpath, obj[array[i].title].subpaths, obj[array[i].title].tree);
      }
    }

  }
  // product view mode
  viewMode(viewmode) {
    var $bitcoin=$('.productsearchpage .special-price .bitcoinWidth,.productsearchpage .special-price .bitcoinSmall');
    var $products = $('.productsearchpage .products-listview, .productsearchpage .products-grid');
    $('.grid-view').removeClass('active');
    $('.list-view').removeClass('active');
    //$grid.on("click", function (e) {
    var $this = $(viewmode);
    $products.addClass('no-animate');
    if (!$this.is('.active')) {
      $this.addClass('active');
      if (viewmode === '.grid-view') {
        $products.removeClass('products-listview').addClass('products-grid');
        $bitcoin.removeClass('bitcoinWidth').addClass('bitcoinSmall');
      } else {
        $bitcoin.removeClass('bitcoinSmall').addClass('bitcoinWidth');
        $products.removeClass('products-grid').addClass('products-listview');
      }

    }
    setTimeout(function () {
      $products.removeClass('no-animate');
    }, 500);
  }

  resize() {
    let winwidth = window.innerWidth;
    if (winwidth <= 991) {
      $('.productsearchpage .products-grid').removeClass('five-in-row')
      $('.productsearchpage .products-grid').removeClass('product-variant-3')
      $('.productsearchpage .products-grid').addClass('three-in-row')
      $('.productsearchpage .products-grid').addClass('product-variant-1')
      $('.productsearchpage .products-item').addClass('previews-3');
    } else {
      $('.productsearchpage .products-grid').removeClass('three-in-row')
      $('.productsearchpage .products-grid').removeClass('product-variant-1')
      $('.productsearchpage .products-grid').addClass('five-in-row')
      $('.productsearchpage .products-grid').addClass('product-variant-3')
      $('.productsearchpage .products-item').removeClass('previews-3');
    }
  }

  // on menu tem select
  onSelectMenuItem(item, i, type) {
    item = this.appService.capitalize(item);
    if (type == 'color') {
      this.colors[i].active = true;
      this.selectedColors.push(item);
    } else if (type == 'brand') {
      this.selectedBrands.push(item);
    }
    this.getAllProducts('', 'list');
  }

  // to remove selected item
  removeSelectedItems(i, type) {
    if (type == 'color') {
      this.selectedColors.splice(i, 1);
    } else if (type == 'brand') {
      this.selectedBrands.splice(i, 1);
    }
    this.getAllProducts('', 'list');
  }
  // to get all Brands
  getAllBrands() {
    this.appService.manageHttp('get', 'brands', '').subscribe((res) => {
      if (res) {
        this.brands = res.brands;
      } else {
        this.brands = [];
      }
    });
  }



  // to select products based on price range 
  onPriceRangeChange(price) {
    this.rangeValues = [];
    if (price == 'Over 5000') {
      this.rangeValues[0] = 5000;
      // this.rangeValues[1]=5000;
    } else if (price == 'Under 500') {
      this.rangeValues[1] = 500;
    } else {
      price = price.split('-');
      this.rangeValues[0] = Number(price[0]);
      this.rangeValues[1] = Number(price[1]);
    }
    this.priceRange = true;
    this.getAllProducts('', 'list');
  }

}

