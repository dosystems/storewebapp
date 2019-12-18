import fake from '../lib/fake';

function Category(options = {}) {
  var name = options.name;
  var categories = options.categories ;

  this.getName = function getName() {
    return name;
  };
  this.getCategories = function getCategories() {
    return categories;
  };
}

export default Category;
