import fake from '../lib/fake';

function Entity(options = {}) {
  var name = options.name;
  var longDesc = options.longDesc || "";
  var shortDesc = options.shortDesc || "";
  var visibleDate = options.visibleDate;
  var expiryDate = options.expiryDate;
  var inventories = options.inventories ;
  var images = options.images;
  var categories = options.categories;
  
  this.getName = function getName() {
    return name;
  };
  
  this.getLongDesc = function getLongDesc() {
    return longDesc;
  };
  
  this.getShortDesc = function getShortDesc() {
    return shortDesc;
  };
  
  this.getVisibleDate = function getVisibleDate() {
    return visibleDate;
  };
  
  this.getExpiryDate = function getExpiryDate() {
    return expiryDate;
  };
  
  this.getInventories = function getInventories() {
    return inventories;
  };

  this.getImages = function getImages() {
    return images;
  }
  this.getCategories = function getCategories() {
    return categories;
  }
}

export default Entity;
