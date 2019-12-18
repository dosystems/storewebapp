import config from '../config/config';

import Brand from '../models/brand.model';
import ImageStore from '../models/entiImage.model';
import Seller from '../models/seller.model';
import Entity from '../models/entity.model';
import Exchangerates from '../models/exchangerates.model';
import Order from '../models/order.model';
import Settings from '../models/setting.model';

import activityService from './activity.service';
import uploadService from './upload.service';
import session from '../utils/session.util';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import dateUtil from '../utils/date.util';


/**
 * set Entity variables
 * @returns {Entity}
 */
async function setCreateEntityVaribles(req, entity) {
  entity.totalAvailable = 0;
  if (req.tokenInfo) {
    entity.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    entity.createdBy.name = session.getSessionLoginName(req);
  };
  //set the owner id based on the token is seller logs in or if admin logs in setting owner id from body
  if (req.tokenInfo) {
    if (req.tokenInfo.loginType === config.commonRole.seller) {
      entity.ownerId = session.getSessionLoginID(req);
      entity.ownerName = session.getSessionLoginName(req);
    }
  };

  if (!entity.entityId) {
    let settings = await Settings.getSettings(req.tokenInfo._id);
    if (settings && settings.vendorPrefix) {
      //generating ramdom product id by adding a prifix from the seller settings
      entity.entityId = settings.vendorPrefix + serviceUtil.generateRandom()
      let entities = await Entity.findUniqueEntityId(entity.entityId);
      if (entities) {
        entity.entityId = settings.vendorPrefix + serviceUtil.generateRandom();
      };
    } else {
      //generating ramdom product id by adding a prifix of first three letters of userName
      //let prefix = session.getSessionLoginName(req).substring(0, 3);
      entity.entityId = 'rf' + serviceUtil.generateRandom();
      let entities = await Entity.findUniqueEntityId(entity.entityId);
      if (entities) {
        entity.entityId = 'rf' + serviceUtil.generateRandom();
      };
    }
  }
  //Adds the brand details in the entity
  if (entity.brandId) {
    let brand = await Brand.get(entity.brandId);
    if (brand) {
      entity.brandName = brand.name;
    };
  };

  //sets the avialable qunatity of an inventories based on the inventory qunatiy 
  if (entity && entity.inventories && entity.inventories.length > 0) {
    for (let val of entity.inventories) {
      val.Available = parseInt(val.Quantity);
      entity.totalAvailable += val.Available;

      val.Hold = 0;
    };
  };

  //splits the categories string and add to multipleCategories object
  if (req.body.categories) {
    let obj = req.body.categories.split(',');
    for (let i = 0; i < obj.length; i++) {
      entity.multipleCategories.set(entity.multipleCategories.length, obj[i])
    };
  };
  entity.status = config.commonStatus.Pending;
  return entity;
};

/**
 * set Entity update variables
 * @returns {Entity}
 */
function setUpdateEntityVaribles(req, entity) {
  entity.updated = Date.now();
  if (req.tokenInfo) {
    entity.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    entity.updatedBy.name = session.getSessionLoginName(req);
  };
  if (req.body.updatedInventories) {
    entity = updateInventories(req, entity);
  }

  //splits the categories string and add to multipleCategories object
  if (req.body.categories) {
    entity.multipleCategories = [];
    let obj = req.body.categories.split(',');
    for (let i = 0; i < obj.length; i++) {
      entity.multipleCategories.set(entity.multipleCategories.length, obj[i])
    };
  };
  return entity;
};

//uupdates the entity if new inventories added or old inventories updated
function updateInventories(req, entity) {
  let obj = req.body.updatedInventories;
  if (obj.length > 0) {
    setUpdateEntityVaribles
    entity.totalAvailable = 0;
    // for (let val of obj) {
    //   val.Available = val.Quantity;
    //   val.Hold = 0;
    // };
    obj.forEach((element, index) => {
      if (entity.inventories[index]) {
        let addedQuantity = element.Quantity - entity.inventories[index].Quantity;
        element.Available = entity.inventories[index].Available + addedQuantity;
        entity.totalAvailable += element.Available;
        element.Hold = entity.inventories[index].Hold;
        // element.Available += entity.inventories[index].Available;
        // entity.totalAvailable += element.Available
        // element.Hold = entity.inventories[index].Hold;
      }
    });
  };
  entity.inventories = obj;
  return entity;
}

/**
 * adding admin commission to product price
 */
function addAdminCommission(entity, req) {
  let charge;
  let setting = req.setting;
  if (setting) {
    if (entity.multipleCategories && entity.multipleCategories.length > 0) {
      for (let category of entity.multipleCategories) {
        if (setting.categories) {
          for (let categoryObj of setting.categories) {
            if (categoryObj.name && categoryObj.name === category) {
              charge = categoryObj.adminCharge;
            }
          }
        }
      }
      // let categories = entity.multipleCategories[0].split("-");
      // let category = categories[categories.length - 1];
      // if (setting.categories) {
      //   for (let categoryObj of setting.categories) {
      //     if (categoryObj.name && categoryObj.name === category) {
      //       charge = categoryObj.adminCharge;

      //     }
      //   }
      // }
    }
    if (!charge) {
      if (setting.vendorWisePercentages && setting.vendorWisePercentages.length > 0) {
        for (let obj of setting.vendorWisePercentages) {
          if (obj.vendorId && JSON.stringify(obj.vendorId) === JSON.stringify(entity.ownerId)) {
            charge = obj.adminCharge;
          }
        }
      }
      if (!charge) {
        if (setting.defaultPercentage) {
          charge = setting.defaultPercentage;
        }
      }
    }
  }
  if (charge) {
    for (let inventory of entity.inventories) {
      if (!(req.query && req.query.loginType && req.query.loginType === 'employee' || req.query.loginType === 'seller')) {
        inventory.MRP += parseFloat((inventory.MRP * (charge / 100)).toFixed(2))
        inventory.adminCommission = parseFloat((inventory.Price * (charge / 100)).toFixed(2));
        inventory.Price += parseFloat((inventory.Price * (charge / 100)).toFixed(2));
      } else if (req.query && req.query.loginType && req.query.loginType === 'employee') {
        inventory.adminCommissionPercentage = charge;
      }

    }
  }
  return entity;
}

/**
 * updating entity details when order place 
 * 
 */
async function updateEntityDetails(req) {
  // if (req.order && req.order.isHold && req.order.status === config.orderStatus.addToCart) {
  //   console.log("************true1122")
  //   req.inventory.Hold = req.inventory.Hold + req.order.quantity;
  //   req.inventory.Available = req.inventory.Available - req.order.quantity;
  //   req.entity.totalAvailable -= req.order.quantity;
  //   req.entity.inventories.splice(req.index, 1, req.inventory);
  // } else
  if (req.order && req.order.status && req.order.status === config.orderStatus.paid) {
    //changing Available quantity  and totalAvailable in product when payment completed 
    req.inventory.Available = req.inventory.Available - req.order.quantity;
    req.entity.totalAvailable -= req.order.quantity;
    req.entity.inventories.splice(req.index, 1, req.inventory);
  } else if (req.order && req.order.status && req.order.status === config.orderStatus.refunded) {
    req.inventory.Available = req.inventory.Available + req.order.quantity;
    req.entity.totalAvailable += req.order.quantity;
    req.entity.inventories.splice(req.index, 1, req.inventory);
  }
  // else if (req.failedOrder && req.failedOrder.status && req.failedOrder.status === config.orderStatus.addToCart) {
  //   // req.inventory.Hold = req.inventory.Hold - req.failedOrder.quantity;
  //   req.inventory.Available = req.inventory.Available + req.failedOrder.quantity;
  //   req.entity.totalAvailable += req.failedOrder.quantity;
  //   req.entity.inventories.splice(req.index, 1, req.inventory);
  // }
  //update avaliable entities based on order place
  await Entity.save(req.entity);
};
async function getPopularProductsIds(req) {
  req.productIds = [];
  let date = dateUtil.getTodayDate()
  let query = {
    filter: [
      {
        $match: {
          status: { $nin: ["AddToCart", "Cancelled", "Returned", "Refunded"] }, active: true,
        }
      },
      {
        $group:
        {
          _id: "$entityId",
          totalAmount: { $sum: "$BUX" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 20 }
    ]
  }
  let producDetails = await Order.getAggregateResult(query)
  for (let val of producDetails) {
    req.productIds.push(val._id)
  }
  return req.productIds;
}


async function insertEntitiesData(req, res) {
  req.seller = await Seller.findOne({ displayName: "craft saga", email: "craftsaga@gmail.com" });
  let obj = await uploadService.generateJsonForEntity(req);
  let imageObj = [];
  if (obj && obj.length > 0) {
    for (let val of obj) {
      if (val && val.entityId) {
        let entity = await Entity.findOne({ entityId: val.entityId });
        if (!entity) {
          let entity = new Entity(val);
          entity = await setCreateEntityVaribles(req, entity);
          req.entity = await Entity.save(entity);
          req.entityType = 'entity';
          req.activityKey = 'productCreate';
          req.contextId = req.entity._id;
          req.contextName = req.entity.name;
          // adding entity create activity
          await activityService.insertActivity(req);
          imageObj.push({ entityId: req.entity._id, images: val.entityImages })

        } else {
          entity = Object.assign(entity, val);
          if (entity.inventories && entity.inventories.length > 0) {
            entity.totalAvailable = 0;
            let index = 0
            for (let inventory of entity.inventories) {
              inventory.Available = inventory.Quantity;
              entity.totalAvailable += inventory.Quantity;
              entity.inventories.splice(index, 1, inventory);
              index++;
            }
          }
          req.entity = await Entity.save(entity);
          req.entityType = 'entity';
          req.activityKey = 'productUpdate';
          req.contextId = req.entity._id;
          req.contextName = req.entity.name;
          // adding entity create activity
          await activityService.insertActivity(req);
          let imgs = await ImageStore.findOne({ entityId: req.entity._id })
          if (!imgs) {
            imageObj.push({ entityId: req.entity._id, images: val.entityImages })
          } else {
            if(imgs && val.entityImages && val.entityImages.length > 0 ){
              let arr = [];
              for(let imges of val.entityImages){
                
                if(imgs.images.indexOf(imges) === -1){
                  arr.push(imges)
                }
              }
              if(arr.length >0){
                imgs.images = imgs.images.concat(arr);
                imgs.active = true; 
                await ImageStore.save(imgs)
              }
            }
          }
        }
      }
    }
  }
  await ImageStore.insertMany(imageObj);
  return obj;
}


function getPriceInDifferentCurrencies(entity, exchangerates) {
  // let query = {
  //   filter: {
  //     active: true
  //   }
  // }
  // let exchangerates = await Exchangerates.list(query);
  if (entity && entity.inventories) {
    let index = 0;
    for (let inventory of entity.inventories) {
      let Currency = [];
      let MRPCurrency = []
      Currency[Currency.length] = { USD: parseFloat((inventory.Price).toFixed(2)) };
      MRPCurrency[MRPCurrency.length] = { USD: parseFloat((inventory.MRP).toFixed(2)) };
      if (exchangerates && exchangerates.length > 0) {
        for (let rates of exchangerates) {
          if (rates.pair === "BUX/USD") {
            Currency[Currency.length] = { BUX: parseFloat((Currency[0].USD / rates.buyRate).toFixed(8)) };
            MRPCurrency[MRPCurrency.length] = { BUX: parseFloat((MRPCurrency[0].USD / rates.buyRate).toFixed(8)) };
          };
          if (rates.pair === "BTC/USD") {
            Currency[Currency.length] = { BTC: parseFloat((Currency[0].USD / rates.buyRate).toFixed(8)) };
            MRPCurrency[MRPCurrency.length] = { BTC: parseFloat((MRPCurrency[0].USD / rates.buyRate).toFixed(8)) };
          };
          if (rates.pair === "EUR/USD") {
            Currency[Currency.length] = { EUR: parseFloat((Currency[0].USD / rates.buyRate).toFixed(2)) };
            MRPCurrency[MRPCurrency.length] = { EUR: parseFloat((MRPCurrency[0].USD / rates.buyRate).toFixed(2)) };
          };
        }
      }
      inventory.Currency = Currency;
      inventory.MRPCurrency = MRPCurrency;
      entity.inventories.splice(index, 1, inventory);
      index++;
    }
  }
  return entity;
}

export default {
  setCreateEntityVaribles,
  setUpdateEntityVaribles,
  updateEntityDetails,
  updateInventories,
  getPopularProductsIds,
  insertEntitiesData,
  getPriceInDifferentCurrencies,
  addAdminCommission
};
