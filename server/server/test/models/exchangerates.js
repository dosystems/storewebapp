import fake from '../lib/fake';

function Exchangerate(options = {}) {
  var type = options.type || "local";
  var pair = options.pair || "BTC/USD";
  var sellRate = options.sellRate || fake.number({min : 7000, max : 8000});
  var buyRate = options.buyRate || fake.number({min : 6000, max : 7000});
  var fee = options.fee || 0.25;
  var minimum = options.minimum || fake.number({min : 10, max : 1000})
  var maximum = options.maximum || fake.number({min : 50000, max : 100000});
  var maxVariationPercentage = options.maxVariationPercentage || fake.number({min : 10, max : 100})
  var minVariationPercentage = options.minVariationPercentage || fake.number({min : 10, max : 100});
  
  this.getType = function getType() {
    return type;
  };
  
  this.getPair = function getPair() {
    return pair;
  };
  
  this.getSellRate = function getSellRate() {
    return sellRate;
  };
  
  this.getBuyRate = function getBuyRate() {
    return buyRate;
  };
  
  this.getFee = function getFee() {
    return fee;
  };
  
  this.getMinimum = function getMinimum() {
    return minimum;
  };

  this.getMaximum = function getMaximum() {
    return maximum;
  };
  this.getMaxVariationPercentage= function getMaxVariationPercentage() {
    return maxVariationPercentage;
  };

  this.getMinVariationPercentage = function getMinVariationPercentage() {
    return minVariationPercentage;
  }
}

export default Exchangerate;
