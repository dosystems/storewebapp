import winstonInstance from 'winston';

/**
 * print info message
 * @param msg
 * @returns {*}
 */
function info(msg) {
  winstonInstance.info(msg);
};

/**
 * print error message
 * @param msg
 * @returns {*}
 */
function error(msg) {
  winstonInstance.error(msg);
};

export default {
  info,
  error
};