import uploadService from '../services/upload.service';

import respUtil from '../utils/resp.util';

/**
 * Uploading multiple records using csv file
 */
async function bulkUpload(req, res) {
  logger.info('Log:Csv Controller:uploadCsvFile: Query : ' + JSON.stringify(req.query));
  req.uploadFile = [];
  req.uploadPath = 'bulkUpload';

  //gets the uploded csv file
  uploadService.upload(req, res, async (err) => {
    if (err) {
      logger.error('Error:Csv Controller:uploadCsvFile: Error : ' + JSON.stringify(err));
      req.i18nkey = "uploadDirectoryNotFound"
      res.json(respUtil.getErrorResponse(req))
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      //converts the csv format to json object format
      req.obj = await uploadService.getJsonFromCsv(req);
    } else {
      req.i18nKey = 'csvNotUploaded';
      logger.error('Error:Csv Controller:uploadCsvFile: Error : csv file not uploaded.');
      return res.json(respUtil.getErrorResponse(req));
    };
    if (req.obj.length > 0) {

      //calling multiple insert activity
      let uploadDetails = await uploadService.insertBulkData(req, res);
      if (uploadDetails) {
        res.json(uploadDetails);
      };
    } else {
      req.i18nKey = 'emptyFile';
      res.json(respUtil.getErrorResponse(req));
    };
  });
};

export default {
  bulkUpload
}