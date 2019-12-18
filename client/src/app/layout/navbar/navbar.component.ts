import { Component, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarService } from '../../navbar.service';
import { Router, ActivatedRoute } from '@angular/router';
import '../../../assets/js/megamenu.min.js';
declare var $;
@Component({
  selector: 'ross-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit,AfterViewInit {
  userDetails: any = {};
  userloggedIn: boolean = false;
  languages = [];
  tree:any;
  products:any;
  cartOrdersCount: Number = 0;
  allCategories:any;
  menu:any=[];
  paths:any;
  mainCategories:any=[];
  newMenu:any=[];
  currencies:any;
  selectedCurrency:any;
  selectedFlag:any='eng.png';
  selectedCategory:any=[];
  topNewMenu:any=[];
  constructor(public activeRoute: ActivatedRoute, public router: Router, public NavService: NavbarService, public translate: TranslateService, public appService: AppService, public appConfig: AppConfig, public toastr: ToastrService) {
    this.getLocalStorageData();
    localStorage.setItem('currency',JSON.stringify(this.appConfig.defaultCurrency));
    this.selectedCurrency=this.appConfig.defaultCurrency;
    this.currencies=this.appConfig.currencies;
    this.languages=this.appConfig.languages;
    this.getAllCategories();
    this.NavService.componentMethodCalled$.subscribe(
      () => {
        this.getLocalStorageData();
      }
    );
    this.NavService.componentMethodCalled2$.subscribe(
      () => {
        this.getAllOrdersInCart();
      }
    );
  }
  ngOnInit() {
    this.getAllOrdersInCart();
  }
  async ngAfterViewInit() {
    this.mobileMenu();
  }


  // on currency change set the selected currency in localStorage
  currencySelect(currency){
    this.selectedCurrency=currency;
    localStorage.setItem('currency',JSON.stringify(currency));
    this.NavService.callComponentMethodCalledCurrency();
    
  }


  // on Country change

  onLangaugeSelect(lang){
    this.selectedFlag=lang.flag;
    this.translate.use(lang.value);
  }

  

  // mobile menu
  mobileEvent() {
    var $mobilemenu = $(".mobilemenu"),
    $mobileCaret = $('ul.nav li .arrow', $mobilemenu),
    $mobileLink = $('ul.nav li > a', $mobilemenu);
    $mobileCaret.on('click.mobileMenu', function (e) {
      e.preventDefault();
      var $parent = $(this).parent();
      if ($parent.hasClass('submenu-open')) {
        $('li.submenu-open ul', $parent).slideUp(200);
        $('li', $parent).removeClass('submenu-open');
        $parent.removeClass('submenu-open');
        $('> ul', $parent).slideUp(200);
        $parent.removeData('firstclick');
      } else {
        $parent.addClass('submenu-open');
        $(' > ul', $parent).slideDown(200);
        $parent.data('firstclick', true);
      }
    });
    if ($mobilemenu.hasClass('dblclick')) {
      $mobileLink.on('click.mobileMenu', function (e) {
        e.preventDefault();
        var $parent = $(this).parent();
        if (!$parent.data('firstclick') && $parent.find('ul').length) {
          $parent.addClass('submenu-open');
          $(' > ul', $parent).slideDown(200);
          $parent.data('firstclick', true);
        } else {
          var href = $(this).attr("href"),
            target = $(this).attr("target") ? $(this).attr("target") : '_self';
          window.open(href, target);
          $parent.removeData('firstclick');
        }
      });
    }
  }

	mobileMenu () {
    var $body = $('body');
    var $window = $(window);
    var $document = $(document);
		var $mobilemenu = $(".mobilemenu"),
			$toggleMenu = $('.mobilemenu-toggle'),
			$mobileCaret = $('ul.nav li .arrow', $mobilemenu),
			$mobileLink = $('ul.nav li > a', $mobilemenu);

		$toggleMenu.on('click.mobileMenu', function () {
			$mobilemenu.toggleClass('active');
			$body.toggleClass('fixed');
			return false;
		});
		$mobilemenu.on('click.mobileMenu', function (e) {
			if ($(e.target).is($mobilemenu)) {
				$mobilemenu.toggleClass('active');
				$body.toggleClass('fixed');
				e.preventDefault();
			}
		});
		var windowWidth = $window.width();

		if (windowWidth < 678) {
			this.mobileEvent();
		}

		var prevWindow = windowWidth;
    var $this = this;
		$window.on('resize', function () {  
			var currentWindow = window.innerWidth || $window.width();
			if (currentWindow != prevWindow) {
        setTimeout(()=>{   
          $mobileLink.unbind('click.mobileMenu');
          $mobileCaret.unbind('click.mobileMenu');
          if (currentWindow > 991) {
            $body.removeClass('fixed');
            $mobilemenu.removeClass('active');
          } else {$this.mobileEvent()}
        }, 500);
				prevWindow = currentWindow;
			}
		});
  }
 
  

  // to open logout model

  showlogoutModal(modalid) {
    $('#' + modalid).appendTo("body").modal('show');
  }
  // to search products in global search
  SearchProducts(event?: any,type?:any) {
    if(type=='navCategory'){
      let cat=event;
      let search='';

      if(cat.tree&&(cat.tree!='')){
        search=cat.tree;
      }
      if(search!=''){
        search+='-';
      }
      if (cat.title) {
        search +=cat.title;
      }
      event=search;
    }
    if (!(this.router.url === '/products')) {
      this.router.navigate(['/products']);
    }
    localStorage.setItem('Search', event);
    this.NavService.callComponentMethod();
  }
  // To get logged in user data from localstorage
  getLocalStorageData() {
    if (localStorage.getItem('user')) {
      this.userloggedIn = true;
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user && user.user._id) {
        this.userDetails = user.user;
      }
    } else {
      this.userloggedIn = false;
    }
  }
  // On click logout
  logout() {
    localStorage.clear();
    $('#logoutModal').modal('hide');
    this.toastr.success('Logged out successfully')
    this.router.navigate(['/']);
    this.NavService.callComponentMethod();
    this.NavService.callComponentMethod2();
  }
  

  // To get all orders count added in cart
  getAllOrdersInCart() {
    this.cartOrdersCount=0;
    let localstorageOrdersCount=0;
       // to show count of local storage data
       if(localStorage.getItem('orders')){
        let orders = JSON.parse(localStorage.getItem('orders'));
        if (orders&&orders.length>0) {
          orders.forEach(order => {
            if(order.quantity)
            localstorageOrdersCount=Number(localstorageOrdersCount)+Number(order.quantity);
          });
        }else{
          this.cartOrdersCount=0;
        }
      }
    this.appService.getOrdersList('AddToCart')
      .subscribe(res => {
        if (res && res.totalQuantity) {
          this.cartOrdersCount = localstorageOrdersCount+res.totalQuantity;
        }else{
          this.cartOrdersCount = localstorageOrdersCount;
        }
      });
     
  }



  // Function to get all categories

  getAllCategories() {
    this.appService.manageHttp('get', 'categories', '').subscribe(async res => {
      if (res && res.categories && res.categories.length && res.categories.length > 0) {
        this.allCategories = res.categories;
        this.allCategories.sort(function(a, b) {
          return +(a.tree > b.tree) || +(a.tree === b.tree) - 1;
        });
        await  this.getPaths();
        await this.createMenuArray(this.menu, this.paths.subpaths,'');
      } else {
        this.menu = [];
      }
      if(this.menu && this.menu.length>0){
        for(var i=0;i<this.menu.length;i++){
          if(this.menu[i].title=='Products'){
            for(var j=0;j<this.menu[i].subpath.length;j++){
              if(this.menu[i].subpath[j].subpath.length==0||this.menu[i].subpath[j].count==0){
                delete this.menu[i].subpath[j];
              }
            }

            // to take the subpaths of products in array
            let subpathArray=this.menu[i].subpath;
            this.selectedCategory=this.menu[i].subpath[0];

            // to sort the array based products count
            subpathArray.sort(function(c, d) {
              return +(c.count > d.count) || +(c.count === d.count) - 1;
            });
            subpathArray.reverse();

            this.newMenu=[];
            subpathArray.forEach(path => {
              this.newMenu.push(path);
            });
          }
        }
        
        // to show only 5 categories in menu
        this.topNewMenu=this.newMenu;
        if(this.topNewMenu&&this.topNewMenu.length>6){
          this.topNewMenu=this.topNewMenu.slice(0, 6);
        }
        
      }
    })
  }

  selectcategory(path){
    this.selectedCategory=path;
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
      subpaths: {},tree:tree1
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

  async createMenuArray(array, obj,path) {
    for (let prop in obj) {
      let result=[];
      result = this.allCategories.filter(function(cat) {
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
      array.push({ title: prop, id: Math.floor((Math.random() * 1000) + 1), subpath: [],count:count,tree:path});
    }
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i].title].subpaths) {
        await this.createMenuArray(array[i].subpath, obj[array[i].title].subpaths,obj[array[i].title].tree);
      }
    }

  }
 
}


