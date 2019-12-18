import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
const Schema = mongoose.Schema;

/**
 * Buyer Schema
 */
const BuyerSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  midleName: {
    type: String
  },
  displayName: {
    type: String
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  photo: {
    type: String
  },
  dateOfBirth: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  email: {
    type: String
  },
  noOfProductsBuy: {
    type: Number
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  isBitsolivesUser:{
    type: Boolean,
    default: false
  },
  isFirstPurchaseComplete:{
    type:Boolean,
    default: false
  },
  lastActivity: {
    type: String
  },
  totalAmount: {
    type: Number
  },
  language:{
    type: String,
    default: 'en'
  },
  country:{
    type:String
  },
  address: [
    {
      name: {
        type: String
      },
      phone: {
        type: String
      },
      street: {
        type: String
      },
      city: {
        type: String
      },
      zip: {
        type: String
      },
      pincode: {
        type: String
      },
      state: {
        type: String
      },
      country: {
        type: String
      },
      countryCode:{
        type: String
      },
      active: {
        type: Boolean,
        default: true
      }
    }
  ],
  wallet: {
    EUR: {
      type: Number,
      default: 0.0
    },
    BUX: {
      type: Number,
      default: 0.0
    }
  },
  gender: {
    type: String
  },
  reviewsCount: {
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
  status: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
});

/**
 * Hook a pre save method to hash the password
 */
BuyerSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */
BuyerSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    let result = owasp.test(this.password);
    if (result.errors.length) {
      let error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
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
BuyerSchema.methods = {
  /**
  * Create instance method for authenticating buyer
  * @param {password}
  */
  authenticate(password) {
    return this.password === this.hashPassword(password);
  },

  /**
  * Create instance method for hashing a password
  * @param {password}
  */
  hashPassword(password) {
    if (this.salt && password) {
      return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    } else {
      return password;
    }
  }
};

/**
 * Statics
 */
BuyerSchema.statics = {
  /**
   * save and update buyer
   * @param buyer
   * @returns {Promise<Buyer, APIError>}
   */
  save(buyer) {
    return buyer.save()
      .then((buyer) => {
        if (buyer) {
          return buyer;
        }
        const err = new APIError('Error in buyer', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get buyer
   * @param {ObjectId} id - The objectId of buyer.
   * @returns {Promise<Buyer, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((buyer) => {
        if (buyer) {
          return buyer;
        }
        const err = new APIError('No such buyer exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List buyer in descending order of 'createdAt' timestamp.
   * @returns {Promise<Buyer[]>}
   */
  list(query) {
    return this.find(query.filter, { "password": 0, "salt": 0 })
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of buyer records
   * @returns {Promise<Buyer[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Find unique email.
   * @param {string} email.
   * @returns {Promise<Buyer[]>}
   */
  findUniqueEmail(email) {
    email = email.toLowerCase();
    return this.findOne({
      email: email,
      active: true
    })
      .exec()
      .then((buyer) => buyer);
  },

  getAggregate(query) {
    return this.aggregate(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  getAggregateResult(query) {
    return this.aggregate(query.filter)
  }
};

/**
 * @typedef Buyer
 */
export default mongoose.model('Buyer', BuyerSchema);
