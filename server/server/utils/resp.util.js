import i18nService from './i18n.util';
import httpStatus from 'http-status';

/**
 * get error response
 * @param req
 * @returns {responseObj}
 */
function getErrorResponse(req) {
  let errorMessage = i18nService.getI18nMessage(req.i18nKey);
  let createErrObj = {
    errorCode: 9001,
    errorMessage: errorMessage
  };
  return createErrObj;
};

/**
 * create success response
 * @param req
 * @returns {responseObj}
 */
function createSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.NO_CONTENT,
    respMessage: i18nService.getI18nMessage(req.activityKey)
  };
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  };
  if (req.query.response === 'true') {
    createSucObj.details = req[req.entityType];
  };
  return createSucObj;
};

/**
 * update success response
 * @param req
 * @returns {responseObj}
 */
function uploadLogoSucessResponse(req) {
  let responseObj = {
    respCode: httpStatus.NO_CONTENT,
    respMessage: i18nService.getI18nMessage(req.uploadPath + 'Upload'),
    fileName: req.image
  };
  return responseObj;
};

/**
 * update success response
 * @param req
 * @returns {responseObj}
 */
function updateSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.RESET_CONTENT,
    respMessage: i18nService.getI18nMessage(req.activityKey)
  };
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  };
  if (req.query.response === 'true') {
    createSucObj.details = req[req.entityType];
  };
  return createSucObj;
};
/**
 * remove success response
 * @param req
 * @returns {responseObj}
 */
function removeSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.PARTIAL_CONTENT,
    respMessage: i18nService.getI18nMessage(req.activityKey)
  };
  if (req.entityType) {
    createSucObj[req.entityType + 'Id'] = req[req.entityType] ? req[req.entityType]._id : '';
  };
  return createSucObj;
};

/**
 * success response
 * @param req
 * @returns {responseObj}
 */
function successResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey)
  };
  return createSucObj;
};

/**
 * login success response
 * @param req
 * @returns {responseObj}
 */
function loginSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey),
    accessToken: req.token.accessToken,
    refreshToken: req.token.refreshToken,
    details: req[req.entityType],
    permissions: {}
  };
  if (req.permissions) {
    createSucObj.permissions = req.permissions
  }
  return createSucObj;
};

/**
 * logout success response
 * @param req
 * @returns {responseObj}
 */
function logoutSuccessResponse(req) {
  let createSucObj = {
    respCode: httpStatus.OK,
    respMessage: i18nService.getI18nMessage(req.i18nKey)
  };
  return createSucObj;
};
/**
 * error search response
 * @param req
 * @returns {responseObj}
 */
function getErrorSearchResponse(req) {
  let errorMessage = req.i18nKey ? i18nService.getI18nMessage(req.i18nKey) : '';
  let createErrObj = {
    errorCode: 9001,
    errorMessage: req.serverMessage || errorMessage,
    query: req.queryData
  };
  return createErrObj;
};

function uploadCsvSucessResponse(req) {
  let responseObj = {
    respCode: httpStatus.NO_CONTENT,
    respMessage: i18nService.getI18nMessage(req.query.type + 'CsvUpload'),
    fineName: req.attachment
  };
  return responseObj;
};

export default {
  getErrorResponse,
  createSuccessResponse,
  updateSuccessResponse,
  removeSuccessResponse,
  successResponse,
  loginSuccessResponse,
  logoutSuccessResponse,
  getErrorSearchResponse,
  uploadLogoSucessResponse,
  uploadCsvSucessResponse
};
