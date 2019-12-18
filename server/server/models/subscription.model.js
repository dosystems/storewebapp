import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
import crypto from 'crypto';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * SubscriptionSchema Schema
 */
const SubscriptionSchema = new mongoose.Schema({
  sellerName: {
    type: String
  },
  sellerId: {
    type: Schema.ObjectId,
    ref: "Seller"
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  planId: {
    type: Schema.ObjectId,
    ref: "Plan"
  },
  planName: {
    type: String
  },
  duration: {
    type: Number
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  discountPercentage: {
    type: Float
  },
  actualAmount: {
    type: Float
  },
  ammountPaid: {
    type: Float
  },
  description: {
    type: String
  },
  status: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    name: {
      type: String
    }
  },
  updatedBy: {
    seller: {
      type: Schema.ObjectId,
      ref: 'Sellers'
    },
    name: {
      type: String
    }
  },
});


/**
 * Statics
 */
SubscriptionSchema.statics = {
  /**
   * save and update Subscription
   * @param subscription
   * @returns {Promise<SubscriptionSchema, APIError>}
   */
  save(subscription) {
    return subscription.save()
      .then((subscription) => {
        if (subscription) {
          return subscription;
        }
        const err = new APIError('Error in subscriptionSchema', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get Subscription
   * @param {ObjectId} id - The objectId of Subscription.
   * @returns {Promise<SubscriptionSchema, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((subscription) => {
        if (subscription) {
          return subscription;
        }
        const err = new APIError('No such subscriptionSchema exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List Subscription in descending order of 'createdAt' timestamp.
   * @returns {Promise<SubscriptionSchema[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip(query.page - 1)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of Subscription records
   * @returns {Promise<SubscriptionSchema[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};


/**
 * @typedef Subscription
 */
export default mongoose.model('Subscription', SubscriptionSchema);