"use strict";
import path from 'path';
import fs from 'fs';
const payload = {};

/*
* Automatically load all payload templates:
* 1. read all 'js' files in 'payloads/'
*
*/
function getFileNames(dir, ext) {
  let fileList = [];

  function isExpectedExtension(file, ext) {
    return ext ? path.extname(file) === ext : true;
  }

  fs.readdirSync(dir).forEach(file => {
    if (isExpectedExtension(file, ext)) {
      fileList.push(path.join(dir, file))
    }
  });

  return fileList;
}

getFileNames(__dirname + "/.", ".js").forEach(file => {
  if (file.match("template")) {
    Object.assign(payload, require(`${file}`).default());
  }
});

function Payloads() {
  if (!Object.keys(payload).length) throw new Error("Template payloads not found");

  return Object.assign({
    getPostBody(entity) {
      return payload[`getPost${entity.constructor.name}`].apply(null, [entity]);
    },
    getPostLogin(entity) {
      return payload[`getLogin${entity.constructor.name}`].apply(null, [entity]);
    }
  }, payload);
}

export default new Payloads();
