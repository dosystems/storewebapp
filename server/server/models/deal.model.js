import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Deal Schema
 */
const DealSchema = new mongoose.Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  discount: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
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
    name: {
      type: String
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  images: {
    type: Array
  },
  productName: {
    type: String
  },
  productId: {
    type: Schema.ObjectId,
    ref: "Entity"
  }
});

/**
 * Statics
 */
DealSchema.statics = {
  /**
   * save and update deal
   * @param deal
   * @returns {Promise<Deal, APIError>}
   */
  save(deal) {
    return deal.save()
      .then((deal) => {
        if (deal) {
          return deal;
        };
        const err = new APIError('Error in deal', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get deal
   * @param {ObjectId} id - The objectId of deal.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((deal) => {
        if (deal) {
          return deal;
        };
        const err = new APIError('No such deal exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List deal in descending deal of 'createdAt' timestamp.
   * @returns {Promise<Deal[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of deal records
   * @returns {Promise<Deal[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Deal
 */
export default mongoose.model('Deal', DealSchema);
