import session from '../utils/session.util';
/**
 * set Seller variables
 * @returns {Seller}
 */
function setCreateColorVaribles(req, color) {
  if (req.tokenInfo) {
    color.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    color.createdBy.name = session.getSessionLoginName(req);
  }
  return color;
}

/**
 * set Seller update variables
 * @returns {Seller}
 */
function setUpdateColorVaribles(req, color) {
  color.updated = Date.now();
  if (req.tokenInfo) {
    color.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    color.updatedBy.name = session.getSessionLoginName(req);
  };
  return color;
};

/**
 * update sizeChart of specific color
 * @param {*} req 
 * @param {*} color 
 */
function updateColorDetails(req, color) {
  if (req.body && req.body.sizeChart && req.body.sizeChart.length > 0) {
    for (let sizeChart of req.body.sizeChart) {
      if (sizeChart.operation === 0) {
        //adding new size chart in color
        color.sizeChart.set(color.sizeChart.length, sizeChart);
      } else if (sizeChart.operation === 1) {
        //updating existing size chart 
        for (let val of color.sizeChart) {
          if (JSON.stringify(val._id) === JSON.stringify(sizeChart.id)) {
            val = Object.assign(val, sizeChart);
          }
        }
      } else if (sizeChart.operation === 2) {
        //deleting sizechart
        for (let val of color.sizeChart) {
          if (JSON.stringify(val._id) === JSON.stringify(sizeChart.id)) {
            val.active = false;
          }
        }
      }
    }
    delete req.body.sizeChart;
  }
  return color;
}

export default {
  setCreateColorVaribles,
  setUpdateColorVaribles,
  updateColorDetails
};
