import config from '../config/config';

import Brand from '../models/brand.model';
import Entity from '../models/entity.model';

import activityService from '../services/activity.service';
import brandService from '../services/brand.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
 * Load Brand and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.brand = await Brand.get(req.params.brandId);
  return next();
};

/**
 * Get brand
 * @param req
 * @param res
 * @returns {details: Brand}
 */
async function get(req, res) {
  logger.info('Log:Brand Controller:get: query :' + JSON.stringify(req.query));
  let brand = req.brand;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: brand
  };
  res.json(responseJson);
};

/**
 * Create new brand
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Brand Controller:create: body :' + JSON.stringify(req.body));
  let brand = new Brand(req.body);
  brand = brandService.setCreateBrandVaribles(req, brand);
  req.brand = await Brand.save(brand);
  req.entityType = 'brand';
  req.activityKey = 'brandCreate';
  req.contextId = req.brand._id;
  req.contextName = req.brand.name;

  // creating activity for new brand
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing brand
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Brand Controller:update: body :' + JSON.stringify(req.body));
  let brand = req.brand;
  if (req.body && req.body.sizeChart) {
    brand = await brandService.updateBrandDetails(req, brand);
  }

  brand = Object.assign(brand, req.body);
  brand = brandService.setUpdateBrandVaribles(req, brand);
  req.brand = await Brand.save(brand);
  req.entityType = 'brand';
  req.activityKey = 'brandUpdate';
  req.contextId = req.brand._id;
  req.contextName = req.brand.name;

  // creating update activity for brand
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get brand list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {brands: brands, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Brand Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'brand';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Brand.totalCount(query);
  };

  //get total brands
  const brands = await Brand.list(query);
  for (let brnd of brands) {
    let products = await Entity.find({ active: true, brandId: brnd._id })
    brnd.productCount = products.length;
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.brands = brands;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete brand.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Brand Controller:remove: query :' + JSON.stringify(req.query));
  let brand = req.brand;
  brand.active = false;
  brand = brandService.setUpdateBrandVaribles(req, brand);
  req.brand = await Brand.save(brand);
  req.entityType = 'brand';
  req.activityKey = 'brandDelete';
  req.contextId = req.brand._id;
  req.contextName = req.brand.name;

  // create delete activity for brand
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


/**
 * upload Brand sizechart image
 * @param req
 * @param res
 */
async function uploadSizeChartImage(req, res, next) {
  logger.info('Log:brand Controller :Upload sizechart image:body:' + JSON.stringify(req.body));
  req.uploadFile = [];
  req.uploadPath = 'sizeChart';
  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:brand Controller:upload sizeChart  : Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile;
      resizeMultipleImages(req);
      setTimeout(function () {
        res.json(respUtil.uploadLogoSucessResponse(req));
      }, 3000);
    } else {
      req.i18nKey = 'sizeChartImageUploadErrorMessage';
      res.json(respUtil.getErrorResponse(req));
    };
  });
};


// resize uploaded images with size
async function resizeMultipleImages(req) {
  if (req.uploadFile && req.uploadFile.length > 0) {
    for (let image of req.uploadFile) {
      let size = {};
      for (let obj of config.uploadImageSizes) {
        size = JSON.stringify(obj);
        req.size = JSON.parse(size);
        req.resizeImage = image;
        let uploadImages = await uploadeService.uploadMultipleSizes(req);
      };
    };
  }
}
export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadSizeChartImage,
  resizeMultipleImages
};
