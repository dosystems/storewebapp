import fake from '../lib/fake';

function Order(options = {}) {
  var entityId = options.entityId ;
  var entityName = options.entityName;
  var inventory = options.inventory;
  var quantity = options.quantity;
  var shippingFrom = options.shippingFrom;
  var status = options.status;
  var category = options.category;
  var currencies = options.currencies;
  
  this.getEntityId = function getEntityId() {
    return entityId;
  };
  
  this.getEntityName = function getEntityName() {
    return entityName;
  };
  
  this.getInventory = function getInventory() {
    return inventory;
  };
  
  this.getQuantity = function getQuantity() {
    return quantity;
  };
  
  this.getShippingFrom = function getShippingFrom() {
    return shippingFrom;
  };
  
  this.getStatus = function getStatus() {
    return status;
  };

  this.getCategory = function getCategory() {
    return category;
  };
  this.getCurrencies = function getCurrencies() {
    return currencies;
  }
}

export default Order;
