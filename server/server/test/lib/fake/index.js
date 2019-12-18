const Faker = require("faker");
const Chance = require("chance");

function getChance() {
  return new Chance();
}

function getFaker() {
  return Faker;
}

function appendPostfix(val) {
  return `${val}: ${getChance().natural({min: 9999, max: 999999})}`
}

export default {
  name: function(opts = {}) {
    let name = getChance().name(opts);
    return name;
  },
  postfix: function() {
    return getChance().natural({min: 9999, max: 999999});
  },
  password: function(opts = {}) {
    return getFaker().internet.password();
  },
  email: function(opts){
    return getChance().email(opts || {length: 15, domain: 'yopmail.com'});
  },
  jobTitle : function(opts = {}) {
    return getFaker().name.jobTitle(opts);
  },
  phone : function(opts = {}) {
    return getChance().phone(opts);
  },
  street : function(opts = {}) {
    return getChance().address(opts);
  },
  word : function(opts = {}) {
    let word = getChance().word(opts);
    return opts.postfix ? appendPostfix(word) : word;
  },
  sentence : function(opts = {}) {
    return getChance().sentence(opts);
  },
  string : function(opts = {}) {
    const pool = opts.pool || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = opts.length || 10;

    const str = getChance().string({pool: pool, length: length});

    return opts.postfix ? appendPostfix(str) : str;
  },
  number : function (opts = {}) {
    const min = opts.min || 1;
    const max = opts.max && opts.max > min? opts.max: min + 10000;
    return getChance().natural({min: min, max: max})
  }
}