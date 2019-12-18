import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Attribute Schema
 */
const AttributeSchema = new mongoose.Schema({
  name: {
    type: String
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
  }
});

/**
 * Statics
 */
AttributeSchema.statics = {
  /**
   * save and update attribute
   * @param attribute
   * @returns {Promise<Attribute, APIError>}
   */
  save(attribute) {
    return attribute.save()
      .then((attribute) => {
        if (attribute) {
          return attribute;
        };
        const err = new APIError('Error in attribute', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get attribute
   * @param {ObjectId} id - The objectId of attribute.
   * @returns {Promise<Attribute, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((attribute) => {
        if (attribute ) {
          return attribute;
        };
        const err = new APIError('No such attribute exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List attribute in descending order of 'createdAt' timestamp.
   * @returns {Promise<Attribute[]>}
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
   * Count of attribute records
   * @returns {Promise<Attribute[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
};

/**
 * @typedef Attribute
 */
export default mongoose.model('Attribute', AttributeSchema);
