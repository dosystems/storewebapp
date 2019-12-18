import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Review Schema
 */
const ReviewSchema = new mongoose.Schema({
  userId: {
    type: Schema.ObjectId,
    ref: "Buyer"
  },
  userName: {
    type: String
  },
  entityId: {
    type: Schema.ObjectId,
    ref: "Entity"
  },
  entityName: {
    type: String
  },
  ownerId: {
    type:  Schema.ObjectId,
    ref: "Seller" 
  },
  ownerName:{
    type: String
  },
  comment: {
    type: String
  },
  rating: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  title: {
    type: String
  },
  inappropriate: {
    type: Boolean,
    default: false
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
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Statics
 */
ReviewSchema.statics = {
  /**
   * save and update review
   * @param review
   * @returns {Promise<Review, APIError>}
   */
  save(review) {
    return review.save()
      .then((review) => {
        if (review) {
          return review;
        };
        const err = new APIError('Error in review', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get review
   * @param {ObjectId} id - The objectId of review.
   * @returns {Promise<Review, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .populate('createdBy.buyer', 'displayName address.country')
      .populate('updatedBy.buyer', 'displayName address.country')
      .exec()
      .then((review) => {
        if (review) {
          return review;
        };
        const err = new APIError('No such review exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List review in descending order of 'createdAt' timestamp.
   * @returns {Promise<Review[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .populate('createdBy.buyer', 'displayName address.country')
      .populate('updatedBy.buyer', 'displayName address.country')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of review records
   * @returns {Promise<Review[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
};

/**
 * @typedef Review
 */
export default mongoose.model('Review', ReviewSchema);
