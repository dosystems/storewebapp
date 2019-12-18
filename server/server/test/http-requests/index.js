'use strict';
import bodyTemplates from   "./lib/payloads";
import requestOptions from  "./lib/options";
import requestSender  from  "./lib/requestSender";
import authorization  from  "./lib/authorization";
import httpUtils from "./lib/httpUtils"

function httpRequests() {

  function createEntity(entity, token) {
    var POST = requestOptions.getPOST(entity, token);
    return requestSender.sendRequest(POST)
       .then((response) => {
         return httpUtils.setEntityId(entity, response);
       })
       .catch((err) => httpUtils.throwError("Error on Create Entity", entity, err));
  }

  return {

    /**
     *
     * @param entity
     * @param {Object} [user]
     * @returns {*}
     */
    createAndConfigureEntity(entity, user){
      return authorization.getAccess(user)
        .then((token) => {
          return createEntity(entity, token);
        })
        .catch((err) => httpUtils.throwError("Error trying to create and then configure entity", entity, err));
    },


    /**
     *
     * @param entityList
     * @param user
     * @returns {*}
     */
    createEntities(entityList, user){
      var entities = [];
      if(Array.isArray(entityList)) {
        entities = entityList;
      } else {
        entities.push(entityList);
      }

      return authorization.getAccess(user)
        .then((token) => {
          var promiseArray = [];
          entities.forEach(entity => {
              promiseArray.push(
                  createEntity(entity, token)
              );
          });
          return Promise.all(promiseArray);
        })
        .catch((err) => httpUtils.throwError("Error trying to create entities", entities, err));
    }
  };
}

export default new httpRequests();
