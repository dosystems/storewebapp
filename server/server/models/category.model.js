import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Category Schema
 */
const CategorySchema = new mongoose.Schema({
  name: {
    type: String
  },
  parent: {
    type: String
  },
  tree: {
    type: String
  },
  sharePercentage: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  count: {
    type: Number
  },
  updated: {
    type: Date
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    name: {
      type: String
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    name: {
      type: String
    }
  },
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Statics
 */
CategorySchema.statics = {
  /**
   * save and update category
   * @param category
   * @returns {Promise<Category, APIError>}
   */
  save(category) {
    return category.save()
      .then((category) => {
        if (category) {
          return category;
        };
        const err = new APIError('Error in category', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get category
   * @param {ObjectId} id - The objectId of category.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((category) => {
        if (category) {
          return category;
        };
        const err = new APIError('No such category exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List category in descending order of 'createdAt' timestamp.
   * @returns {Promise<Category[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of category records
   * @returns {Promise<Category[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
  getDetails(tree) {
    return this.findOne(
      {
        'tree': tree,
        'active': tree
      }
    );
  }
};

/**
 * @typedef Category
 */
export default mongoose.model('Category', CategorySchema);
