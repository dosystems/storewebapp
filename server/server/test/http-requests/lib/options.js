"use strict";
import fs from "fs";
import path from "path";
import apiEnums from "./../api/api.enums";
import bodyTemplates from "./payloads";
const loginApi  = apiEnums.apiUrl.LOGIN;

function Option() {

  function getBaseApi(entity) {
    switch (entity.constructor.name) {
      case 'User':
        return 'api/users';
      case 'Employee':
        return 'api/employees';
      default:
        break;
    }
  }

  function getPostApi(entity) {
    switch (entity.constructor.name) {
      case 'User':
        return getBaseApi(entity)+'?response=true';
        break;
      case 'Carrier':
        return getBaseApi(entity)+'?response=true';
        break;
      default:
        return getBaseApi(entity)+'?response=true';
        break;
    }
  }


  return {
    getLogin(entity) {
      var options = {
          headers: {
            'Accept': 'application/json'
          }
      };

      options.url = loginApi;
      options.method = 'POST';
      options.json = bodyTemplates.getPostLogin(entity);
      return options;
    },
    
    getPOST(entity, token){
      var options = {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
          }
      };

      options.url = getPostApi(entity);
      options.method = 'POST';
      options.json = bodyTemplates.getPostBody(entity);
      return options;
    }
  };
}

export default new Option();

