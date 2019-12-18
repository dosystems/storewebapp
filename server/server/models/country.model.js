import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * Country Schema
 */
var CountrySchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  flag: {
    type: String,
    default: ''
  },
  countryCode: {
    type: String
  },
  code: {
    type: String,
    default: ''
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
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    buyer: {
      type: Schema.ObjectId,
      ref: "Buyer"
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    buyer: {
      type: Schema.ObjectId,
      ref: "Buyer"
    }
  }
});

/**
 * Statics
 */
CountrySchema.statics = {
  /**
   * save and update country
   * @param country
   * @returns {Promise<Country, APIError>}
   */
  save(country) {
    return country.save()
      .then((country) => {
        if (country) {
          return country;
        };
        const err = new APIError('Error in country', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get country
   * @param {ObjectId} id - The objectId of country.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .exec()
      .then((country) => {
        if (country) {
          return country;
        };
        const err = new APIError('No such country exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List country in descending order of 'createdAt' timestamp.
   * @returns {Promise<Country[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of country records
   * @returns {Promise<Country[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
  getDetails(tree) {
    return this.findOne(
      {
        'tree': tree,
        'active': tree
      }
    );
  }
};

/**
 * @typedef Country
 */
export default mongoose.model('Country', CountrySchema);
