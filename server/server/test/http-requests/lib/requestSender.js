'use strict';
import request from 'request';

function RequestSender() {
  
  return {
    /**
     *
     * @param {Object} options - request options (headers, url, method, etc)
     * @param {String} [requestDescription] - request short description. If passed, it will be used in logging (basically,
     *  it needs to reduce log size and avoid log garbage)
     * @return {Promise}
     */
    sendRequest(options) {
      return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
          if(error) {
            reject(error);
          } else {
            resolve(response.body);
          }
        });
      });
    }
  }
}

export default new RequestSender();
