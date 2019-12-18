"use strict";
const originalBeforeAll = global.beforeAll;

function tuBeforeAll(...params) {
  let beforeAllFunc;

  params.forEach((param) => {
    if (typeof param === 'function') beforeAllFunc = param;
  });

  originalBeforeAll((done) => {
    return Promise.resolve(beforeAllFunc)
        .then((result) => result())
        .then(() => done())
        .catch((err) => {

            done.fail(err);
        });
  })
};

export default tuBeforeAll;
