var fs = require('fs');
import config from '../config/config';
import saveImage from 'save-image';

import brandModel from '../models/brand.model';
import Entity from '../models/entity.model';
import Exchangerates from '../models/exchangerates.model';
import Order from '../models/order.model';
import ImageModel from '../models/entiImage.model';
import Settings from '../models/setting.model';
import activityService from '../services/activity.service';
import entityService from '../services/entity.service';
import favoriteService from '../services/favorite.service';

import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
  * Implement async for each process
  * @param {Array} array 
  * @param {Function} callback 
  */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/**
 * Load Entity and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.entity = await Entity.get(req.params.entityId);
  return next();
};

/**
 * Get entity
 * @param req
 * @param res
 * @returns {details: Entity}
 */
async function get(req, res) {
  logger.info('Log:Entity Controller:get: query :' + JSON.stringify(req.query));
  let entity = req.entity;
  let favorites = await favoriteService.getFavorite(req);
  if (favorites && favorites.length > 0) {
    for (let favorite of favorites) {
      if (JSON.stringify(entity._id) === JSON.stringify(favorite.entityId)) {
        entity.isFavorite = true;
        entity.favoriteId = favorite._id;
      }
    }
  }
  if (entity) {
    req.setting = await Settings.findOne({
      active: true,
      role: config.roles.superAdmin
    });
    entity = entityService.addAdminCommission(entity, req);
    let exchangerates = await Exchangerates.find({ active: true });
    entity = entityService.getPriceInDifferentCurrencies(entity, exchangerates);
  }

  if (entity && entity.brandId) {
    let brand = await brandModel.get(entity.brandId);
    entity.sizeChart = brand.sizeChart;
  }
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: entity
  };
  req.query = await serviceUtil.generateListQuery(req);
  req.history = [];
  req.query.filter.contextId = entity.id;
  await activityService.getHistory(req);
  if (req.history.length > 0) {
    responseJson.history = req.history;
  };


  res.json(responseJson);
};

/**
 * Create new entity
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Entity Controller:create: body :' + JSON.stringify(req.body));
  let entity = new Entity(req.body);
  entity = await entityService.setCreateEntityVaribles(req, entity);
  req.entity = await Entity.save(entity);
  req.entityType = 'entity';
  req.activityKey = 'productCreate';
  req.contextId = req.entity._id;
  // adding entity create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing entity
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Entity Controller:update: body :' + JSON.stringify(req.body));
  let entity = req.entity;
  if (req.tokenInfo && req.tokenInfo.loginType === config.commonRole.employee) {
    if (req.query && req.query.type && req.query.type === config.commonStatus.Active) {
      entity.status = config.commonStatus.Active;
    } else if (req.query && req.query.type && req.query.type === config.commonStatus.Rejected) {
      entity.status = config.commonStatus.Rejected;
    } else if (req.query && req.query.type && req.query.type === config.commonStatus.Blocked) {
      entity.status = config.commonStatus.Blocked;
    }
  }
  entity = Object.assign(entity, req.body);
  entity.isFavorite = false;
  entity = entityService.setUpdateEntityVaribles(req, entity);
  req.entity = await Entity.save(entity);
  req.entityType = 'entity';
  req.activityKey = 'productUpdate';
  req.contextId = req.entity._id;
  // adding entity update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get entity list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {entities: entities, pagination: pagination}
 */
async function list(req, res, next) {
  console.log(req.query)
  let responseJson = {}, asc, desc;
  logger.info('Log:activity Controller:list: query :' + JSON.stringify(req.query));
  // if (req.query && req.query.filter) {
  //   let filter = JSON.parse(req.query.filter)
  //   if (filter && filter.globalSearch) {
  //     let value = filter.globalSearch.value;
  //     let array = value.split(" ");
  //     let index = array.indexOf("and");
  //     if (index !== -1) {
  //       array.splice(index, 1, "&");
  //     }
  //     value = array.join(" ");
  //     filter.globalSearch.value = value;
  //     req.query.filter = JSON.stringify(filter);
  //   }
  // }
  if (!(req.query && req.query.loginType && req.query.loginType === 'employee' || req.query.loginType === 'seller')) {
    req.entityType = 'entity';
  }

  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Entity.totalCount(query);
  };
  //get total entities  
  let entities = await Entity.list(query);
  //adding admin commission to price
  if (entities) {
    req.setting = await Settings.findOne({
      active: true,
      role: config.roles.superAdmin
    });
    let exchangerates = await Exchangerates.find({ active: true });
    if (query && query.sortfield && query.sortfield === "inventories.Price") {
      if (query && query.direction && query.direction === "desc") {
        desc = true;
      } else if (query && query.direction && query.direction === "asc") {
        asc = true;
      }
    }

    for (let entity of entities) {
      entity = entityService.addAdminCommission(entity, req);
      entity = entityService.getPriceInDifferentCurrencies(entity, exchangerates);
      if (asc) {
        entity.inventories.sort((a, b) => {
          return a.Price - b.Price;
        })
      } else if (desc) {
        entity.inventories.sort((a, b) => {
          return b.Price - a.Price;
        })
      }
    }
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.entities = entities;
  responseJson.pagination = query.pagination;


  res.json(responseJson);

};

/**
 * Delete entity.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Entity Controller:remove: query :' + JSON.stringify(req.query));
  let entity = req.entity;
  entity.active = false;
  entity = entityService.setUpdateEntityVaribles(req, entity);
  req.entity = await Entity.save(entity);
  req.entityType = 'entity';
  req.activityKey = 'productDelete';
  req.contextId = req.entity._id;

  // adding entity delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

// resize uploaded images with size
async function resizeMultipleImages(req) {
  if (req.uploadFile && req.uploadFile.length > 0) {
    for (let image of req.uploadFile) {
      let size = {};
      for (let obj of config.uploadImageSizes) {
        size = JSON.stringify(obj);
        req.size = JSON.parse(size);
        req.resizeImage = image.name;
        let uploadImages = await uploadeService.uploadMultipleSizes(req);
      };
    };
  }
}

/**
 * change entity profilePucture
 * @param req
 * @param res
 */
async function uploadEntityImages(req, res, next) {
  logger.info('Log:Entity Controller :Upload entity logos:body:' + JSON.stringify(req.body));
  req.uploadFile = [];
  req.uploadPath = 'entity';
  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:entity Controller: Change entity Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile;
      resizeMultipleImages(req);
      setTimeout(function () {
        res.json(respUtil.uploadLogoSucessResponse(req));
      }, 3000);
    } else {
      req.i18nKey = 'entityLogoUploadedErrorMessage';
      logger.error('Error:Entity Entity:Change Entity Logo: Error : Entity Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    };
  });
};
/**
 * getting stock low information for vendor 
 */

async function getLowStockList(req, res) {
  let responseJson = {};
  let lowStockEntities = [];
  logger.info('Log:Entity Controller:getLowStockList: query :' + JSON.stringify(req.query));
  req.entityType = 'entity';
  const query = serviceUtil.generateListQuery(req);
  let entities = await Entity.find({ active: true, status: "Active", ownerId: req.tokenInfo._id });
  if (entities && entities.length > 0) {
    for (let entity of entities) {
      let quantity = 0;
      if (entity && entity.inventories && entity.inventories.length > 0) {
        for (let inventory of entity.inventories) {
          quantity += inventory.Quantity
        }
      }
      if (entity) {
        if (entity.totalAvailable <= (quantity * 20) / 100) {
          lowStockEntities.push(entity)
        }
      }
    }
  }
  query.pagination.totalCount = lowStockEntities.length;
  if (query.page) {
    // total count 
    lowStockEntities = lowStockEntities.splice((query.page - 1) * (query.limit), query.limit)
  }
  //get total entities
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.entities = lowStockEntities;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
}

/**
 * NeverPurchasedProductsList  information of products for vendor 
 */

async function getNeverPurchasedProductsList(req, res) {
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req);
  if (req.tokenInfo && req.tokenInfo._id) {
    query.filter.ownerId = req.tokenInfo._id;
  }
  let entities = await Entity.list(query);
  let results = [];
  for (let entity of entities) {
    let duplicates = await Order.findOne({ active: true, entityId: entity._id, status: config.orderStatus.paid })
    if (!duplicates) {
      results.push(entity)
    }
  }
  responseJson.pagination = {
    entities: results,
    totalCount: results.length
  }
  res.jsonp(responseJson);
}
async function getPopularProducts(req, res) {
  req.productIds = await entityService.getPopularProductsIds(req);
  req.aggregateType = 'popularProduct';
  let query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await Entity.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  };
  let products = await Entity.getAggregate(query);
  if (products.length > 0) {
    req.setting = await Settings.findOne({
      active: true,
      role: config.roles.superAdmin
    });
    let exchangerates = await Exchangerates.find({ active: true });
    for (let entity of products) {
      entity = entityService.addAdminCommission(entity, req);
      entity = entityService.getPriceInDifferentCurrencies(entity, exchangerates);
    }
  }
  res.json({ products: products, pagination: query.pagination })

}

async function downloadAndUploadImg(req, res) {
  let query = { filter: { active: true } };
  let images = await ImageModel.list(query);
  var start = new Date().getTime();
  let uploadImages;
  if (images && images.length > 0) {
    res.json({ respCode: 200, respMessage: "Images are downloading......." })
    console.log('================>>>>>>')
    console.log('Images are downloading ')
    console.log('================>>>>>>')
    // let index = 1;
    // for (let val of images) {
    //   console.log(index)
    //   let img = await uploadeService.downloadImages(val.images);
    //   let images = await uploadeService.resizeMultipleImages(img, req);
    //   let entity = await Entity.findOne({ active: true, _id: val.entityId });
    //   if (entity && entity.images) {
    //     entity.images = [{ Color: "Default", images: images }];
    //   }
    //   val.active = false;
    //   let imgarray = await ImageModel.save(val);
    //   entity = await Entity.save(entity);
    //   index++;
    // }
    for (let obj of images) {
      req.entityImages = []
      console.log(obj.entityId)
      console.log(obj.images.length)
      for (let imgurl of obj.images) {
        // req.imageUrl = imgurl; 
        // let n = await downloadImages(req)
        // console.log(n)
        const imageUrl = imgurl;
        let imagePath = imageUrl.split("/");
        let imageName = imagePath[imagePath.length - 1];
        let n = await saveImage(imageUrl, config.upload.entity + "/" + imageName);
        req.uploadPath = 'entity'
        let isNotCurrupted = await serviceUtil.isImageCurrupted(imageName);
        if (isNotCurrupted) {
          for (let obj1 of config.uploadImageSizes) {
            let size = JSON.stringify(obj1);
            req.size = JSON.parse(size);
            req.resizeImage = imageName;
            try {
              uploadImages = await uploadeService.uploadMultipleSizes(req);
            } catch (error) {
              console.log("=========> error file =============>")
              console.log(req.resizeImage)
              console.log(error)
              console.log("=========> error file =============>")
            }
          };
          // if (uploadImages) {
          //   req.entityImages.push(imageName);
          // }
        } else {
          console.log(imageName)
        }
      }
      console.log("==========> success " + obj.entityId)
      //remove old images and save new images
      
      // let entity = await Entity.get(obj.entityId)
      // if (entity) {
      //   if (entity.images && entity.images.length > 0) {
      //     for (let obj of entity.images) {
      //       for (let name of obj.images) {
      //         if(req.entityImages.indexOf(name) === -1){
      //           console.log("entered")
      //           let paths = [
      //             config.upload.entity,
      //             config.upload.entity + "/l",
      //             config.upload.entity + "/s",
      //             config.upload.entity + "/m"
      //           ]
      //           for (let path of paths) {
      //             fs.unlink(path + "/" + name, function (error) {
      //               try {
      //               } catch (error) {
      //                 console.log(".....????")
      //               }
      //             });
      //           }
      //         }  
      //       }
      //     }
      //   }

      //   entity.images = {
      //     Color: "Default",
      //     images: req.entityImages
      //   }
      //   await Entity.save(entity)
      // }
      obj.active = false;
      await ImageModel.save(obj);
    }
    console.log('================>>>>>>')
    console.log('Images downloading completed ')
    console.log('================>>>>>>')
  } else {
    res.json({ errCode: 9001, errMessage: "Images not found......." })
    console.log('================>>>>>>')
    console.log('Images not found ')
    console.log('================>>>>>>')
  }
  var end = new Date().getTime();
  var time = end - start;
  console.log('Execution time: ' + time);
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadEntityImages,
  resizeMultipleImages,
  getLowStockList,
  getNeverPurchasedProductsList,
  getPopularProducts,
  downloadAndUploadImg
};
