import session from '../utils/session.util';

/**
 * set Seller variables
 * @returns {Seller}
 */
function setCreateBrandVaribles(req, brand) {
  if (req.tokenInfo) {
    brand.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    brand.createdBy.name = session.getSessionLoginName(req);
  }
  return brand;
}

/**
 * set Seller update variables
 * @returns {Seller}
 */
function setUpdateBrandVaribles(req, brand) {
  brand.updated = Date.now();
  if (req.tokenInfo) {
    brand.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    brand.updatedBy.name = session.getSessionLoginName(req);
  };
  return brand;
};

/**
 * update sizeChart of specific brand
 * @param {*} req 
 * @param {*} brand 
 */
function updateBrandDetails(req, brand) {
  if (req.body && req.body.sizeChart && req.body.sizeChart.length > 0) {
    for (let sizeChart of req.body.sizeChart) {
      if (sizeChart.operation === 0) {
        //adding new size chart in brand
        brand.sizeChart.set(brand.sizeChart.length, sizeChart);
      } else if (sizeChart.operation === 1) {
        //updating existing size chart 
        for (let val of brand.sizeChart) {
          if (JSON.stringify(val._id) === JSON.stringify(sizeChart.id)) {
            val = Object.assign(val, sizeChart);
          }
        }
      } else if (sizeChart.operation === 2) {
        //deleting sizechart
        for (let val of brand.sizeChart) {
          if (JSON.stringify(val._id) === JSON.stringify(sizeChart.id)) {
            val.active = false;
          }
        }
      }
    }
    delete req.body.sizeChart;
  }
  return brand;
}

export default {
  setCreateBrandVaribles,
  setUpdateBrandVaribles,
  updateBrandDetails

};
