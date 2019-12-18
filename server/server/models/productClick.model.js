import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * ProductClick Schema
 */
const ProductClickSchema = new mongoose.Schema({
  userId: {
    type: Schema.ObjectId,
    ref: "Buyer"
  },
  userName: {
    type: String
  },
  entityId: {
    type: Schema.ObjectId,
    ref: "Entity"
  },
  name: {
    type: String
  },
  price: {
    type: Number
  },
  reviews: {
    type: Number
  },
  images: {
    type: Array
  },
  created: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  updated: {
    type: Date
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    user: {
      type: Schema.ObjectId,
      ref: 'Buyer'
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
    user: {
      type: Schema.ObjectId,
      ref: 'Buyer'
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
ProductClickSchema.statics = {
  /**
   * save and update productClick
   * @param productClick
   * @returns {Promise<ProductClick, APIError>}
   */
  save(productClick) {
    return productClick.save()
      .then((productClick) => {
        if (productClick) {
          return productClick;
        };
        const err = new APIError('Error in productClick', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get productClick
   * @param {ObjectId} id - The objectId of productClick.
   * @returns {Promise<ProductClick, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .exec()
      .then((productClick) => {
        if (productClick) {
          return productClick;
        };
        const err = new APIError('No such productClick exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List productClick in descending order of 'createdAt' timestamp.
   * @returns {Promise<ProductClick[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of productClick records
   * @returns {Promise<ProductClick[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
  getAggregate(query) {
    return this.aggregate(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  getAggregateResult(query) {
    return this.aggregate(query.filter)
  }
};

/**
 * @typedef ProductClick
 */
export default mongoose.model('ProductClick', ProductClickSchema);
