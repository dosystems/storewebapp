import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Roles Schema
 */
const RolesSchema = new mongoose.Schema({
  role: {
    type: String
  },
  permissions: {
    type: Object
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  updatedBy: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Statics
 */
RolesSchema.statics = {
  /**
   * save and update roles
   * @param roles
   * @returns {Promise<Roles, APIError>}
   */
  save(roles) {
    return roles.save()
      .then((roles) => {
        if (roles) {
          return roles;
        };
        const err = new APIError('Error in roles', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get roles
   * @param {ObjectId} id - The objectId of roles.
   * @returns {Promise<Roles, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((roles) => {
        if (roles) {
          return roles;
        };
        const err = new APIError('No such roles exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List roles in descending order of 'createdAt' timestamp.
   * @returns {Promise<Roles[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of roles records
   * @returns {Promise<Roles[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
};

/**
 * @typedef Roles
 */
export default mongoose.model('Roles', RolesSchema);
