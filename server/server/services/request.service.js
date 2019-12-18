import request from 'request';

/**
 * send request
 * @param options 
 * @returns {response}
 */
function sendRequest(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (!options.body && body) {
        resolve(body);
      } else if (response) {
        resolve(response);
      }
    });
  });
};

export default {
  sendRequest
};
