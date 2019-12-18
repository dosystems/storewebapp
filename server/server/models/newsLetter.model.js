import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * newsLetter Schema
 */
const NewsLetterSchema = new mongoose.Schema({
  name: {
    type: String
  },
  subject: {
    type: String
  },
  data: {
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
  }
});

/**
 * Statics
 */
NewsLetterSchema.statics = {
  /**
   * save and update newsLetter
   * @param newsLetter
   * @returns {Promise<NewsLetter, APIError>}
   */
  save(newsLetter) {
    return newsLetter.save()
      .then((newsLetter) => {
        if (newsLetter) {
          return newsLetter;
        };
        const err = new APIError('Error in newsLetter', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get newsLetter
   * @param {ObjectId} id - The objectId of newsLetter.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((newsLetter) => {
        if (newsLetter) {
          return newsLetter;
        };
        const err = new APIError('No such newsLetter exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List newsLetter in descending order of 'createdAt' timestamp.
   * @returns {Promise<NewsLetter[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of newsLetter records
   * @returns {Promise<NewsLetter[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef NewsLetter
 */
export default mongoose.model('NewsLetter', NewsLetterSchema);
