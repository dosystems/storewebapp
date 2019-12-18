import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import mongooseFloat from 'mongoose-float';

import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

const Float = mongooseFloat.loadType(mongoose);

/**
 * Promocodes Schema
 */
const PromocodesSchema = new mongoose.Schema({
  promoCode: {
    type: String
  },
  promoCodeUniqueId: {
    type: String
  },
  promoType: {
    type: String
  },
  status: {
    type: String
  },
  maxDiscountAmount:{
    type: Number
  },
  minPurchaseValue:{
    type: Number
  },
  discountPercentage: {
    type: Float
  },
  discountAmount:{
    type: Number
  },
  maxUsersLimitToUse: {
    type: Number
  },
  maxNoOfUsersUsedTillNow: {
    type: Number,
    default: 0
  },
  toNewOrOldUsers: {
    type: Array
  },
  requiredCreditCardOrNotForFreeCoupon: {
    type: Boolean
  },
  promoCodeStartDate: {
    type: Date
  },
  promoCodeEndDate: {
    type: Date
  },
  couponData: {
    type: Object
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
PromocodesSchema.statics = {
  /**
   * save and update promocode
   * @param promocode
   * @returns {Promise<Promocode, APIError>}
   */
  save(promocode) {
    return promocode.save()
      .then((promocode) => {
        if (promocode) {
          return promocode;
        }
        const err = new APIError('Error in promocode', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get promocode
   * @param {ObjectId} id - The objectId of promocode.
   * @returns {Promise<Promocode, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((promocode) => {
        if (promocode) {
          return promocode;
        }
        const err = new APIError('No such promocode exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List promocodes in descending order of 'createdAt' timestamp.
   * @returns {Promise<Promocodes[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of promocodes records
   * @returns {Promise<Promocodes[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Find unique promocode.
   * @param {string} promocode.
   * @returns {Promise<promoCode[]>}
   */
  findUniquePromoCode(promocode) {
    return this.findOne({
      promoCode: promocode,
      active: true
    })
      .exec()
      .then((promocode) => promocode);
  },

  /**
   * Find promo code unique id.
   * @param {string} id.
   * @returns {Promise<promoCode[]>}
   */
  findPromoCodeUniqueId(uniqueId) {
    return this.findOne({
      promoCodeUniqueId: uniqueId,
      active: true
    })
      .exec()
      .then((promocode) => promocode);
  }

};

/**
 * @typedef Promocodes
 */
export default mongoose.model('Promocodes', PromocodesSchema);
