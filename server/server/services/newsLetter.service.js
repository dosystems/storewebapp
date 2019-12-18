import session from '../utils/session.util';
import Promise from 'bluebird';
var fs = require('fs');

/**
 * set NewsLetter variables
 * @returns {NewsLetter}
 */
async function setCreateNewsLetterVaribles(req, newsLetter) {
  if (req.tokenInfo) {
    newsLetter.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    newsLetter.createdBy.name = session.getSessionLoginName(req);
  };
  if (newsLetter.data) {
    new Promise((resolve, reject) => {
      fs.writeFile('/var/www/html/ross/server/server/views/newsLetter-subscribe.ejs', newsLetter.data, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    })
  }
  return newsLetter;
};

/**
 * set NewsLetter update variables
 * @returns {NewsLetter}
 */
function setUpdateNewsLetterVaribles(req, newsLetter) {
  newsLetter.updated = Date.now();
  if (req.tokenInfo) {
    newsLetter.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    newsLetter.createdBy.name = session.getSessionLoginName(req);
  };
  return newsLetter;
};

export default {
  setCreateNewsLetterVaribles,
  setUpdateNewsLetterVaribles
};
