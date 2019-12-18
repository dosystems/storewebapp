import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;
/**
 * exchangerates Schema
 */
const ExchangeratesSchema = new mongoose.Schema({
  pair: {
    type: String
  },
  fromCurrency: {
    type: String
  },
  toCurrency: {
    type: String
  },
  minimum: {
    type: Number
  },
  maximum: {
    type: Number
  },
  buyRate: {
    type: Number
  },
  sellRate: {
    type: Number
  },
  fee: {
    type: Number
  },
  type: {
    type: String,
    default: 'local'
  },
  minVariationPercentage: {
    type: Number
  },
  maxVariationPercentage: {
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
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
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
ExchangeratesSchema.statics = {
  /**
   * save and update exchangerates
   * @param exchangerates
   * @returns {Promise<Exchangerates, APIError>}
   */
  save(exchangerates) {
    return exchangerates.save()
      .then((exchangerates) => {
        if (exchangerates) {
          return exchangerates;
        }
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Exchangerates[]>}
    */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
    * Count of exchangerates records
    * @returns {Promise<Exchangerates[]>}
    */
  totalCount(query) {
    console.log(query)
    return this.find(query.filter)
      .count();
  },

  /**
     * Get exchangerates
     * @param {ObjectId} id - The objectId of exchangerates.
     * @returns {Promise<Exchangerates, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((exchangerates) => {
        if (exchangerates) {
          return exchangerates;
        }
        const err = new APIError('No such exchangerates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
  * Get exchangerates
  * @param {ObjectId} id - The objectId of exchangerates.
  * @returns {Promise<Exchangerates, APIError>}
  */
  getExchangerateByPair(reqPair) {
    return this.findOne({ pair: reqPair })
      .exec()
      .then((exchangerate) => {
        if (exchangerate) {
          return exchangerate;
        }
        const err = new APIError('No such exchangerates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Exchangerates
 */
export default mongoose.model('Exchangerates', ExchangeratesSchema);
