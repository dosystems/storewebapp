import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
const Schema = mongoose.Schema;

/**
 * Seller Schema
 */
const SellerSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  displayName: {
    type: String
  },
  password: {
    type: String
  },
  companyName: {
    type: String
  },
  productCategory: {
    type: String
  },
  brand: {
    type: String
  },
  location: {
    type: String
  },
  storeName: {
    type: String
  },
  website: {
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
  noOfProducts: {
    type: Number
  },
  lastActivity: {
    type: String
  },
  bussinessVolume: {
    type: Number
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  address: {
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    countryCode: {
      type: String
    },
    zip: {
      type: String
    }
  },
  shopTitle: {
    type: String
  },
  logo: {
    type: String
  },
  socialMediaLinks: {
    type: Array
  },
  storePolicy: {
    type: String
  },
  billingOptions: {
    type: Array
  },
  gender: {
    type: String
  },
  identificationNumber: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  retailOutlets: {
    type: String
  },
  country: {
    type: String
  },
  KYCDocs: {
    type: Array
  },
  totalAmount: {
    type: Number
  },
  bankDetails: {
    bankName: {
      type: String
    },
    beneficiaryName: {
      type: String
    },
    branch: {
      type: String
    },
    accountNumber: {
      type: String
    },
    IBAN: {
      type: String
    },
    swiftCode: {
      type: String
    }
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
SellerSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */
SellerSchema.pre('validate', function (next) {
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
SellerSchema.methods = {
  /**
  * Create instance method for authenticating seller
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
SellerSchema.statics = {
  /**
   * save and update seller
   * @param seller
   * @returns {Promise<Seller, APIError>}
   */
  save(seller) {
    return seller.save()
      .then((seller) => {
        if (seller) {
          return seller;
        }
        const err = new APIError('Error in seller', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get seller
   * @param {ObjectId} id - The objectId of seller.
   * @returns {Promise<Seller, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((seller) => {
        if (seller) {
          return seller;
        }
        const err = new APIError('No such seller exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List seller in descending order of 'createdAt' timestamp.
   * @returns {Promise<Seller[]>}
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
   * Count of seller records
   * @returns {Promise<Seller[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Find unique email.
   * @param {string} email.
   * @returns {Promise<Seller[]>}
   */
  findUniqueEmail(email) {
    email = email.toLowerCase();
    return this.findOne({
      email: email,
      active: true
    })
      .exec()
      .then((seller) => seller);
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
 * @typedef Seller
 */
export default mongoose.model('Seller', SellerSchema);
