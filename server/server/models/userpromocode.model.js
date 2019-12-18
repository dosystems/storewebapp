import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import mongooseFloat from 'mongoose-float';

import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

const Float = mongooseFloat.loadType(mongoose);

/**
 * userpromocode Schema
 */
const UserPromocodesSchema = new mongoose.Schema({
  promoCode: {
    type: String
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  status: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    }
  }
});

/**
 * Statics
 */
UserPromocodesSchema.statics = {
  /**
   * save and update userpromocode
   * @param userpromocode
   * @returns {Promise<userpromocode, APIError>}
   */
  save(userpromocode) {
    return userpromocode.save()
      .then((userpromocode) => {
        if (userpromocode) {
          return userpromocode;
        }
        const err = new APIError('Error in userpromocode', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get userpromocode
   * @param {ObjectId} id - The objectId of userpromocode.
   * @returns {Promise<userpromocode, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((userpromocode) => {
        if (userpromocode) {
          return userpromocode;
        }
        const err = new APIError('No such userpromocode exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List userpromocode in descending order of 'createdAt' timestamp.
   * @returns {Promise<userpromocode[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of userpromocode records
   * @returns {Promise<userpromocode[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Find userpromocode by userid.
   * @param {string} userpromocode.
   * @returns {Promise<userpromocode[]>}
   */
  findPromoCodeByUserId(userId, promoCode) {
    return this.findOne({
      promoCode: promoCode,
      userId: userId,
      active: true
    })
      .exec()
      .then((userpromocode) => userpromocode);
  }

};

/**
 * @typedef userpromocode
 */
export default mongoose.model('userpromocode', UserPromocodesSchema);
