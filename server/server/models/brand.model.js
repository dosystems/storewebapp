import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * brand Schema
 */
const BrandSchema = new mongoose.Schema({

  name: {
    type: String
  },
  longName: {
    type: String
  },
  category: {
    type: String
  },
  sizeChart: {
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
  productCount: {
    type: Number
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
BrandSchema.statics = {
  /**
   * save and update brand
   * @param brand
   * @returns {Promise<Brand, APIError>}
   */
  save(brand) {
    return brand.save()
      .then((brand) => {
        if (brand) {
          return brand;
        };
        const err = new APIError('Error in brand', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get brand
   * @param {ObjectId} id - The objectId of brand.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((brand) => {
        if (brand) {
          return brand;
        };
        const err = new APIError('No such brand exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List brand in descending order of 'createdAt' timestamp.
   * @returns {Promise<Brand[]>}
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
   * Count of brand records
   * @returns {Promise<Brand[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Brand
 */
export default mongoose.model('Brand', BrandSchema);
