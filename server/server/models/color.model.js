import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * color Schema
 */
const ColorSchema = new mongoose.Schema({

  name: {
    type: String
  },
  hexCode: {
    type: String
  },
  rgbCode: {
    type: String
  },
  image: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: {
      type: String
    }
  },
  updatedBy: {
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: {
      type: String
    }
  },
  updated: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Statics
 */
ColorSchema.statics = {
  /**
   * save and update color
   * @param color
   * @returns {Promise<Color, APIError>}
   */
  save(color) {
    return color.save()
      .then((color) => {
        if (color) {
          return color;
        };
        const err = new APIError('Error in color', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get color
   * @param {ObjectId} id - The objectId of color.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((color) => {
        if (color) {
          return color;
        };
        const err = new APIError('No such color exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List color in descending order of 'createdAt' timestamp.
   * @returns {Promise<Color[]>}
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
   * Count of color records
   * @returns {Promise<Color[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Color
 */
export default mongoose.model('Color', ColorSchema);
