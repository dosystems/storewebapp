import fake from '../lib/fake';

function Brand(options = {}) {
  var name = options.name || fake.name();
  this.getName = function getName() {
    return name;
  };
}

export default Brand;
