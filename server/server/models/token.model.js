import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Post Schema
 */
const TokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  loginType: String,
  loginFrom: String,
  deviceId: String,
  iosMobileAppVersion: String,
  androidMobileAppVersion: String,
  iosVersion: String,
  iosModel: String,
  devVersion: String,
  androidModel: String,
  expires: Number,
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
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TokenSchema.method({
});

/**
 * Statics
 */
TokenSchema.statics = {

  /**
   * save and update token
   * @param token
   * @returns {Promise<Token, APIError>}
   */
  save(token) {
    return token.save()
      .then((user) => {
        if (user) {
          return user;
        };
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * Find unique Employee token.
   * @param {objectId} employeeId.
   * @returns {Promise<Token>}
   */
  findUniqueEmployeeToken(employeeId) {
    return this.findOne({
      employee: employeeId,
      type: 'employee'
    })
      .exec()
      .then((token) => token);
  },

  findUniqueBuyerToken(buyerId) {
    return this.findOne({
      buyer: buyerId,
      type: 'buyer'
    })
      .exec()
      .then((token) => token);
  },

  findUniqueSellerToken(sellerId) {
    return this.findOne({
      seller: sellerId,
      type: 'seller'
    })
      .exec()
      .then((token) => token);
  },
  
  getLasLogin(filter) {
    return this.find(filter, { 'creeated': 1 })
      .sort({ "created": -1 })
  }
}

/**
 * @typedef Token
 */
export default mongoose.model('Token', TokenSchema);
