import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * plan Schema
 */
const PlanSchema = new mongoose.Schema({
  name: {
    type: String
  },
  duration: {
    type: Number
  },
  price: {
    type: Float
  },
  discount: {
    type: Float
  },
  discountPercentage: {
    type: Float
  },
  priceAfterDiscount: {
    type: Float
  },
  description: {
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
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Statics
 */
PlanSchema.statics = {
  /**
   * save and update plan
   * @param plan
   * @returns {Promise<Plan, APIError>}
   */
  save(plan) {
    return plan.save()
      .then((plan) => {
        if (plan) {
          return plan;
        };
        const err = new APIError('Error in plan', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get plan
   * @param {ObjectId} id - The objectId of plan.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((plan) => {
        if (plan) {
          return plan;
        };
        const err = new APIError('No such plan exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List plan in descending order of 'createdAt' timestamp.
   * @returns {Promise<Plan[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of plan records
   * @returns {Promise<Plan[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  }
};

/**
 * @typedef Plan
 */
export default mongoose.model('Plan', PlanSchema);
