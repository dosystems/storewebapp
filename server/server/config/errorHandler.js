import expressValidation from 'express-validation';
import APIError from '../helpers/APIError';
import winstonInstance from './winston';

export default function (err, req, res) {
  let isStackError = false;
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    if (err.stack) {
      winstonInstance.info(err.stack);
    }
    isStackError = true;
    //    const error = new APIError(unifiedErrorMessage, err.status, true);
    //    return next(error);
  } else if (!(err instanceof APIError)) {
    if (err.stack) {
      winstonInstance.info(err.stack);
    }
    winstonInstance.info(err.message || "Internal server error");
    isStackError = true;
    //    const apiError = new APIError(err.message, err.status, err.isPublic);
    //    return next(apiError);
  }
  if (isStackError) {
    return res.status(500).send({
      errorCode: "9001",
      errorMessage: "Error has occured please contact Bux Super Store support"
    });
  }
  return next(err);
};