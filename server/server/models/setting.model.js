import Promise from 'bluebird';
import mongoose from 'mongoose';
import mongooseFloat from 'mongoose-float';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
const Float = mongooseFloat.loadType(mongoose, 2);
/**
 * Setting Schema
 */
const SettingSchema = new mongoose.Schema({
  categories: [
    {
      name: {
        type: String
      },
      categoryId:{
        type: Schema.ObjectId,
        ref:"Category"
      },
      adminCharge: {
        type: Float
      },
      active:{
        type: Boolean,
        default:true
      }
    }
  ],
  vendorWisePercentages:[
    {
      vendorId: {
        type: Schema.ObjectId,
        ref:"Seller"
      },
      name:{
        type:String
      },
      adminCharge:{
        type:Float
      },
      active:{
        type: Boolean,
        default:true
      }
    }
  ],
  defaultPercentage:{
    type: Float
  },
  discount: [
    {
      name: {
        type: String
      },
      percentage: {
        type: Float
      }
    }
  ],
  role: {
    type: String
  },
  userId: {
    type: Schema.ObjectId
  },
  userName: {
    type: String
  },
  type: {
    type: String
  },
  featuresLimit: {
    type: Number
  },
  categoryLevelsLimit: {
    type: Number
  },
  supportedCountries: {
    type: Array
  },
  supportedLanguages: {
    type: Array
  },
  wallet: {
    EUR: {
      type: Number,
    },
    BUX: {
      type: Number,
    }
  },
  privacyPolicy:{
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  expireTime: {
    type: Number
  },
  vendorPrefix: {
    type: String
  },
  estimatedDeliveryDays: {
    type: Number
  },
  cronJobTime: {
    type: Number
  },
  payments: {
    type: String
  },
  updated: {
    type: Date
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
    name: {
      type: String
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
SettingSchema.statics = {
  /**
   * save and update setting
   * @param setting
   * @returns {Promise<Setting, APIError>}
   */
  save(setting) {
    return setting.save()
      .then((setting) => {
        if (setting) {
          return setting;
        };
        const err = new APIError('Error in setting', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get setting
   * @param {ObjectId} id - The objectId of setting.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((setting) => {
        if (setting) {
          return setting;
        };
        const err = new APIError('No such setting exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List setting in descending order of 'createdAt' timestamp.
   * @returns {Promise<Setting[]>}
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
   * Count of setting records
   * @returns {Promise<Setting[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
  getSettings(id) {
    return this.findOne({ active: true, userId: id })
  }
}


/**
 * @typedef Setting
 */
export default mongoose.model('Setting', SettingSchema);
