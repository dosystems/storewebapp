import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Image Schema
 */
const ImageSchema = new mongoose.Schema({
  entityId: {
    type: Schema.ObjectId,
    ref: "Entity"
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  images: {
    type: Array
  },
});

/**
 * Statics
 */
ImageSchema.statics = {
  /**
   * save and update image
   * @param image
   * @returns {Promise<Image, APIError>}
   */
  save(image) {
    return image.save()
      .then((image) => {
        if (image) {
          return image;
        };
        const err = new APIError('Error in image', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get image
   * @param {ObjectId} id - The objectId of image.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((image) => {
        if (image) {
          return image;
        };
        const err = new APIError('No such image exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List image in descending image of 'createdAt' timestamp.
   * @returns {Promise<Image[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of image records
   * @returns {Promise<Image[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Image
 */
export default mongoose.model('Image', ImageSchema);
