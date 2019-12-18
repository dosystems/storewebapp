import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * CategoryRequest Schema
 */
const CategoryRequestSchema = new mongoose.Schema({
  userId:{
    type:Schema.ObjectId,
    ref:"Seller"
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String
  },
  reason:{
    type: String
  },
  status:{
    type: String
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
});

/**
 * Statics
 */
CategoryRequestSchema.statics = {
  /**
   * save and update CategoryRequest
   * @param CategoryRequest
   * @returns {Promise<CategoryRequest, APIError>}
   */
  save(categoryRequest) {
    return categoryRequest.save()
      .then((categoryRequest) => {
        if (categoryRequest) {
          return categoryRequest;
        };
        const err = new APIError('Error in CategoryRequest', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get CategoryRequest
   * @param {ObjectId} id - The objectId of CategoryRequest.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((categoryRequest) => {
        if (categoryRequest) {
          return categoryRequest;
        };
        const err = new APIError('No such CategoryRequest exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List CategoryRequest in descending CategoryRequest of 'createdAt' timestamp.
   * @returns {Promise<CategoryRequest[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of CategoryRequest records
   * @returns {Promise<CategoryRequest[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef CategoryRequest
 */
export default mongoose.model('CategoryRequest', CategoryRequestSchema);
