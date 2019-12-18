import session from '../utils/session.util';
import Category from '../models/category.model';
import Entity from '../models/entity.model';
import activityService from './activity.service';
import serviceUtil from '../utils/service.util';

/**
 * set Category variables
 * @returns {Category}
 */
function setCreateCategoryVaribles(req, category) {
  if (req.tokenInfo) {
    category.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    category.createdBy.name = session.getSessionLoginName(req);
  };
  if (req.body && req.body.name) {
    category.tree = category.name;
  };
  return category;
}

/**
 * set Category update variables
 * @returns {Category}
 */
async function setUpdateCategoryVaribles(req, category) {
  category.updated = Date.now();
  if (req.tokenInfo) {
    category.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    category.updatedBy.name = session.getSessionLoginName(req);
  };
  if (req.body.name) {
    category.tree = category.name;
  };
  if (req.body.categories) {
    req.oldTree = category.tree;
    req.keys = req.oldTree.split('-');
    req.newTree = req.body.categories.slice(0, req.keys.length);
    if (JSON.stringify(req.keys) !== JSON.stringify(req.newTree)) {
      category = await updateCategory(req, category, req.newTree);
      updateCategories(req);
    } else if (req.body.categories.length > req.keys.length) {
      createCategories(req);
    };
  };
  return category;
};

//create categories
async function createCategories(req) {
  let obj;
  if (req.body.categories) {
    obj = req.body.categories;
  } else if (req.categories) {
    obj = req.categories
  }

  let category, tree, duplicate;
  if (obj.length > 0) {
    for (let i = 0; i < obj.length; i++) {
      tree = '';
      for (let j = 0; j <= i; j++) {
        if (j !== i) {
          tree += obj[j] + "-";
        };
        if (j === i) {
          tree += obj[j];
        };
      };
      duplicate = await Category.getDetails(tree)
      if (!duplicate) {
        category = new Category();
        category.name = obj[i];
        category.parent = obj[i - 1];
        category.tree = tree;
        category = setCreateCategoryVaribles(req, category);
        category = await Category.save(category);
        req.entityType = 'category';
        req.activityKey = 'categoryCreate';
        req.contextId = category._id;

        //adding activity for new category 
        await activityService.insertActivity(req);
      };
    };
  };
};

//update category tree
async function updateCategory(req, category, newTree) {
  let obj, duplicate, tree
  obj = newTree;
  if (obj.length > 0) {
    for (let i = 0; i < obj.length; i++) {
      tree = '';
      for (let j = 0; j <= i; j++) {
        if (j !== i) {
          tree += obj[j] + "-";
        };
        if (j === i) {
          tree += obj[j];
        };
      };
      duplicate = await Category.getDetails(tree)
      if (!duplicate) {
        category.name = obj[i];
        category.parent = obj[i - 1];
        category.tree = tree;
      };
    };
  };
  return category;
};

//Updates all the child categories while upadating the category
async function updateCategories(req) {
  let tree;
  req.query = {};
  req.entity = "category"
  req.query.filter = { "criteria": [{ "key": "tree", "value": req.oldTree, "type": "regexOr" }] }
  let query = serviceUtil.generateListQuery(req);
  let categories = await Category.list(query);
  for (let val of categories) {
    req.oldTree = val.tree.split('-');
    for (let i = 0; i < req.newTree.length; i++) {
      req.oldTree[i] = req.newTree[i];
    };
    val = await updateCategory(req, val, req.oldTree);
    val = await Category.save(val);
  };
  createCategories(req);
};


async function setCategoryCounts(req, categories) {
  if (categories && categories.length > 0) {
    for (let val of categories) {
      if (val && val.tree) {
        req.query = {};
        req.entity = "category"
        req.entityType = 'entity'
        req.query.filter = {
          "criteria": [{"key":"status","value":"Active","type":"regexOr"},
          { "key": "multipleCategories", "value": val.tree, "type": "regexOr" },
          {"key":"totalAvailable","value":0,"type":"ne"}]
        }
        let query = serviceUtil.generateListQuery(req)
        val.count = await Entity.totalCount(query);
      }
    };
  };
  return categories;
}
export default {
  setCreateCategoryVaribles,
  setUpdateCategoryVaribles,
  updateCategory,
  createCategories,
  updateCategories,
  setCategoryCounts
};
