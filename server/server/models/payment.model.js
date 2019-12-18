import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * Payment Schema
 */
const PaymentsSchema = new mongoose.Schema({
  payId: {
    type: String
  },
  payer: {
    type: Object
  },
  created: {
    type: Date
  },
  state: {
    type: String
  },
  transactions: {
    type: Array
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
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
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
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
PaymentsSchema.statics = {
  /**
   * save and update Payment
   * @param Payment
   * @returns {Promise<Payments, APIError>}
   */
  save(payment) {
    return payment.save()
      .then((payment) => {
        if (payment) {
          return payment;
        };
        const err = new APIError('Error in payment', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get Payment
   * @param {ObjectId} id - The objectId of Payment.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((payment) => {
        if (payment) {
          return payment;
        };
        const err = new APIError('No such Payment exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List Payment in descending order of 'createdAt' timestamp.
   * @returns {Promise<Payments[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of Payment records
   * @returns {Promise<Payments[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Payments
 */
export default mongoose.model('Payments', PaymentsSchema);
