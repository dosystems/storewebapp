"use strict";
const Employee  = require("./../../models/employee");
const User      = require("../../models/buyer");

function HttpUtils() {
  
  return {
    throwError(message, entity, error) {
      var entityType = "";

      if(Array.isArray(entity)) {
          var maxQuantity = entity.length - 1;
          var listSeparator = " | ";
          entity.forEach((failedEntity, index) => {
              entityType += failedEntity.constructor.name + (index === maxQuantity ? "" : listSeparator);
          })
      } else {
          entityType = entity.constructor.name;
      }

      var fullErrorMessage = `${message} '${entityType}': ${error}`;
      
      logger.error(fullErrorMessage);

      throw new Error(fullErrorMessage);
    },

    /**
     *
     * @param entity
     * @param response
     */
    setEntityId(entity, response) {
      try {
        if (entity instanceof User) {
          entity.setId(response.userId);
        } else if (entity instanceof Employee) {
          entity.setId(response.employeeId);
        }
      } catch(err) {
          throw new Error("Unable to set entity id. Check the response: " + JSON.stringify(response, null, 4));
      }
    }
  };
}

export default new HttpUtils();
