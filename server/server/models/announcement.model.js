import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * announcement Schema
 */
const AnnouncementSchema = new mongoose.Schema({
  header: {
    type: String
  },
  text: {
    type: String
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
  file: {
    type: String
  },
  type: {
    type: String
  },
  announcementType: {
    type: String
  },
  expireDate: {
    type: Date
  },
  color: {
    type: String
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
  }
});

/**
 * Statics
 */
AnnouncementSchema.statics = {
  /**
   * save and update announcement
   * @param announcement
   * @returns {Promise<Announcement, APIError>}
   */
  save(announcement) {
    return announcement.save()
      .then((announcement) => {
        if (announcement) {
          return announcement;
        };
        const err = new APIError('Error in announcement', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get announcement
   * @param {ObjectId} id - The objectId of announcement.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((announcement) => {
        if (announcement) {
          return announcement;
        };
        const err = new APIError('No such announcement exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List announcement in descending order of 'createdAt' timestamp.
   * @returns {Promise<Announcement[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of announcement records
   * @returns {Promise<Announcement[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Announcement
 */
export default mongoose.model('Announcement', AnnouncementSchema);
