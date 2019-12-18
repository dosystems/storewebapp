"use strict";
import path from 'path';
import args from 'yargs';
import preconditionHandler from "./preconditionHandler";
import utils from "./utils/serviceUtils";
import credentials from './../data/credentials.json';
import User from "./../models/user";

const defaultUser = new User(credentials.validUser);
const originalDescribe = global.describe;
const argv = args.argv;

//import beforeAll from "./btBeforeAll";
//import afterAll from "./btAfterAll";
//
//global.beforeAll = beforeAll;
//global.afterAll = afterAll;

const empty = {
  specName        : "Without spec name",
  featureName     : "Without feature",
  storyName       : "Without story"
};

function tuDescribe(...params) {
  let suiteFunc;
  let suiteDescription = {
    file        : undefined,
    name        : empty.specName,
    feature     : empty.featureName,
    story       : empty.storyName,
    create      : [],
    update      : [],
    login       : defaultUser
  };

  params.forEach((param) => {
      switch (typeof param) {
          case 'string':
              isSpecFileName(param)
                  ? suiteDescription.file = param
                  : suiteDescription.name = param;
              break;
          case 'object':
              Object.assign(suiteDescription, param); // TODO: potentially a weak point
              break;
          case 'function':
              suiteFunc = param;
              break;
          default:
              break;
      }
  });

  if (!suiteFunc) throw new Error("Suite is not defined");


  const suiteFullName = suiteDescription.file
      ? `${path.basename(suiteDescription.file)} | ${suiteDescription.name}`
      : `${suiteDescription.name}`;

  const userToLogin = typeof suiteDescription.login === 'boolean'
      ? suiteDescription.login
      : utils.extractUserCredentials(suiteDescription.login);


  function runByPriority(severity) {
      if (suiteDescription.severity.toLowerCase() === severity.toLowerCase()) {
          return suiteFunc();
      }
  }

  let stringDescription = `${suiteDescription.file} :: ${suiteDescription.name}`;

  return originalDescribe(stringDescription, () => {
      let preconditionCheck = checkCreationList(suiteDescription.create);

      let toCreate = [];
      let toUpdate = [];
      let toDelete = [];

      return Promise.resolve()
              .then(() => {
                  logger.info(`=== ${suiteFullName} ===`);

                  if (preconditionCheck.isInvalid) {
                      throw new PreconditionError(preconditionCheck);
                  } else {
                      toCreate = preconditionHandler.groupPreconditions(suiteDescription.create);
                      toUpdate = suiteDescription.update;
                      toDelete = toCreate;
                  }

                  // Execute preconditions in parallel: 1. execute http requests (in sequence) 2. login to app
                  return Promise.all([
                      preconditionHandler.execute({create: toCreate, update: toUpdate})
                  ]);
              }).then(() => {
                return argv.severity ? runByPriority(argv.severity) : suiteFunc();
              });
  });
};

export default tuDescribe;


function defineFeatureName(suiteDescription) {
    if(suiteDescription.feature === empty.featureName && suiteDescription.file) {
        return path.basename(suiteDescription.file).split("-")[1];
    } else {
        return suiteDescription.feature;
    }
}


function defineStoryName(suiteDescription) {
    return suiteDescription.story === empty.storyName ? suiteDescription.name : suiteDescription.story;
}


function isSpecFileName(param) {
    return param.match(/spec-/);
}

function checkCreationList(createParams) {
    let details = {
        isInvalid: false,
        message: '',
        entities: []
    };

    let entityList = [];

    if (!Array.isArray(createParams)) {
        details.isInvalid = true;
        details.message = 'Create list should be an array';
    } else {
        entityList = createParams.reduce((paramList, currentParam) => {
            return currentParam.entities ? paramList.concat(currentParam.entities) : paramList.concat(currentParam);
        }, []);
    }

    return entityList.reduce((result, entity) => {
        if(entity.isNotFound) {
            result.isInvalid = true;
            result.message = `${result.message} ${entity.message}`;
        }
        return result;
    }, details);
}
