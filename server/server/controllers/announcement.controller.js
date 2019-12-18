import Announcement from '../models/announcement.model';

import activityService from '../services/activity.service';
import announcementService from '../services/announcement.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
 * Load Announcement and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.announcement = await Announcement.get(req.params.announcementId);
  return next();
};

/**
 * Get announcement
 * @param req
 * @param res
 * @returns {details: Announcement}
 */
async function get(req, res) {
  logger.info('Log:Announcement Controller:get: query :' + JSON.stringify(req.query));
  let announcement = req.announcement;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: announcement
  };
  res.json(responseJson);
};

/**
 * Create new announcement
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Announcement Controller:create: body :' + JSON.stringify(req.body));
  let announcement = new Announcement(req.body);
  announcement = await announcementService.setCreateAnnouncementVaribles(req, announcement);
  req.announcement = await Announcement.save(announcement);
  req.entityType = 'announcement';
  req.activityKey = 'announcementCreate';
  req.contextId = req.announcement._id;
  req.contextName = req.announcement.header;

  // creating activity for new announcement 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing announcement
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Announcement Controller:update: body :' + JSON.stringify(req.body));
  let announcement = req.announcement;

  announcement = Object.assign(announcement, req.body);
  announcement = announcementService.setUpdateAnnouncementVaribles(req, announcement);
  req.announcement = await Announcement.save(announcement);
  req.entityType = 'announcement';
  req.activityKey = 'announcementUpdate';
  req.contextId = req.announcement._id;
  req.contextName = req.announcement.header;

  // creating activity for announcement update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get announcement list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {announcements: announcements, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Announcement Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'announcement';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total announcements count in that page 
    query.pagination.totalCount = await Announcement.totalCount(query);
  };

  //get total announcements
  const announcements = await Announcement.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.announcements = announcements;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete announcement.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Announcement Controller:remove: query :' + JSON.stringify(req.query));
  let announcement = req.announcement;
  announcement.active = false;
  announcement = announcementService.setUpdateAnnouncementVaribles(req, announcement);
  req.announcement = await Announcement.save(announcement);
  req.entityType = 'announcement';
  req.activityKey = 'announcementDelete';
  req.contextId = req.announcement._id;
  req.contextName = req.announcement.header;

  // creating activity for announcement delete 
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};
/**
 * change Announcement Atachment
 * @param req
 * @param res
 */
async function uploadAtachment(req, res, next) {
  logger.info('Req body:' + JSON.stringify(req.body));
  let announcement = req.announcement;
  req.uploadFile = [];
  req.uploadPath = 'announcement';

  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:Announcement Controller: Change Announcement Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile[0].name;
      announcement.file = req.uploadFile[0].name;

      //Saving the changes of the announcement
      req.announcement = Announcement.save(announcement)
      req.entityType = 'announcement';
      req.activityKey = 'announcementUpload';
      req.contextId = req.announcement._id;
      req.contextName = req.announcement.header;

      //adding announcement logo activity
      activityService.insertActivity(req);
      res.json(respUtil.uploadLogoSucessResponse(req))
    } else {
      req.i18nKey = 'announcementLogoUploadedErrorMessage';
      logger.error('Error:Announcement Announcement:Change Announcement Logo: Error : Announcement Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    }
  })
};
export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadAtachment
};
