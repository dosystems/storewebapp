import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * favorite Schema
 */
const FavoriteSchema = new mongoose.Schema({
  entityId: {
    type: Schema.ObjectId,
    ref: "Entity"
  },
  entityName: {
    type: String
  },
  userId: {
    type: Schema.ObjectId
  },
  userName: {
    type: String
  },
  entity: {
    type: Object
  },
  created: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
    },
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
  updatedBy: {
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
    },
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
FavoriteSchema.statics = {
  /**
   * save and update favorite
   * @param favorite
   * @returns {Promise<Favorite, APIError>}
   */
  save(favorite) {
    return favorite.save()
      .then((favorite) => {
        if (favorite) {
          return favorite;
        };
        const err = new APIError('Error in favorite', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get favorite
   * @param {ObjectId} id - The objectId of favorite.
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
      .then((favorite) => {
        if (favorite) {
          return favorite;
        };
        const err = new APIError('No such favorite exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List favorite in descending order of 'createdAt' timestamp.
   * @returns {Promise<Favorite[]>}
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
   * Count of favorite records
   * @returns {Promise<Favorite[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Favorite
 */
export default mongoose.model('Favorite', FavoriteSchema);
