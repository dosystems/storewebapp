import fake from '../lib/fake';

function NewsLetter(options = {}) {
  var name = options.name || fake.name();
  var subject = options.subject;
  var data = options.data;
  var type = options.type;
  this.getName = function getName() {
    return name;
  };
  this.getSubject = function getSubject() {
    return subject;
  };
  this.getData = function getData() {
    return data;
  };
  this.getType = function getType() {
    return type;
  };
}

export default NewsLetter;
