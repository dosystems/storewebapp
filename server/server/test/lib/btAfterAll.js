"use strict";
const originalAfterAll = global.afterAll;

function tuAfterAll(...params) {
  let afterAllFunc;

  params.forEach((param) => {
    if (typeof param === 'function') afterAllFunc = param;
  });

  function runAfterAll(done) {
    Promise.resolve(afterAllFunc)
        .then((afterAllFuncBody) => afterAllFuncBody())
        .then(() => done())
        .catch((err) => done.fail(err));
  }

  originalAfterAll((done) => runAfterAll(done));
};

export default tuAfterAll;
