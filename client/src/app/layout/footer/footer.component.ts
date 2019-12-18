import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../app.config';
import { AppService } from '../../app.service';
import { NavbarService } from '../../navbar.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'ross-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(public activeRoute: ActivatedRoute, public router: Router, public NavService: NavbarService,  public appService: AppService, public appConfig: AppConfig) { }
  allCategories:any;
  menu:any=[];
  paths:any;

  ngOnInit() {
    this.getAllCategories();
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
        this.menu.sort(function(c, d) {
          return +(c.count > d.count) || +(c.count === d.count) - 1;
        });
        this.menu.reverse();
        for(var i=0;i<this.menu.length;i++){
          if(this.menu[i].title=='Products'){
            for(var j=0;j<this.menu[i].subpath.length;j++){
              if(this.menu[i].subpath[j].subpath.length==0||this.menu[i].subpath[j].count==0){
                delete this.menu[i].subpath[j];
              }
            }
          }
        }
        // console.log( this.menu);
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
