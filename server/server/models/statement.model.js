import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

/**
 * Statement Schema
 */
const StatementSchema = new mongoose.Schema({
  userId: {
    type: Schema.ObjectId
  },
  userName: {
    type: String
  },
  commission: {
    type: Float
  },
  favorTo: {
    type: String
  },
  orderId: {
    type: Schema.ObjectId,
    ref: 'Order'
  },
  type: {
    type: String
  },
  remarks: {
    type: String
  },
  amount: {
    type: Float
  },
  buxTradable: {
    type: Float
  },
  buxTradableBefore: {
    type: Float
  },
  buxTradableAfter: {
    type: Float
  },
  charge: {
    type: Float
  },
  status: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
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
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
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
StatementSchema.statics = {
  /**
   * save and update statement
   * @param statement
   * @returns {Promise<statement, APIError>}
   */
  save(statement) {
    return statement.save()
      .then((statement) => {
        if (statement) {
          return statement;
        };
        const err = new APIError('Error in statement', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get statement
   * @param {ObjectId} id - The objectId of statement.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName firstName lastName')
      .populate('updatedBy.employee', 'displayName firstName lastName')
      .populate('createdBy.buyer', 'displayName firstName lastName')
      .populate('createdBy.seller', 'displayName firstName lastName companyName')
      .populate('updatedBy.buyer', 'displayName firstName lastName')
      .populate('updatedBy.seller', 'displayName firstName lastName companyName')
      .exec()
      .then((statement) => {
        if (statement) {
          return statement;
        };
        const err = new APIError('No such statement exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List statement in descending order of 'createdAt' timestamp.
   * @returns {Promise<Statement[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName firstName lastName')
      .populate('updatedBy.employee', 'displayName firstName lastName')
      .populate('createdBy.buyer', 'displayName firstName lastName')
      .populate('createdBy.seller', 'displayName firstName lastName companyName')
      .populate('updatedBy.buyer', 'displayName firstName lastName')
      .populate('updatedBy.seller', 'displayName firstName lastName companyName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of statement records
   * @returns {Promise<Statement[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
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
 * @typedef Statement
 */
export default mongoose.model('Statement', StatementSchema);
