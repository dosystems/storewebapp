import fake from '../lib/fake';

function Attribute(options = {}) {
  var name = options.name || fake.name();
  this.getName = function getName() {
    return name;
  };
}

export default Attribute;
