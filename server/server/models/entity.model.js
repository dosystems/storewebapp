import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Entity Schema
 */
const EntitySchema = new mongoose.Schema({
  brandId: {
    type: Schema.ObjectId,
    ref: "Company"
  },
  brandName: {
    type: String
  },
  sizeChart: {
    type: String
  },
  ownerId: {
    type: Schema.ObjectId,
    ref: "Seller"
  },
  ownerName: {
    type: String
  },
  deals: {
    type: Array
  },
  entityId: {
    type: String
  },
  name: {
    type: String
  },
  shortDesc: {
    type: String
  },
  longDesc: {
    type: String
  },
  buxPercentage: {
    type: Number
  },
  euroPercentage: {
    type: Number
  },
  companyName: {
    type: String
  },
  location: {
    type: String
  },
  retailOutlets: {
    type: String
  },
  status: {
    type: String
  },
  visibleDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  totalAvailable: {
    type: Number
  },
  images: {
    type: Array
  },
  inventories: {
    type: Array
  },
  privacyPolicy: {
    type: String
  },
  isReturnable: {
    type: Boolean,
    default: true
  },
  availableCountries: {
    type: Array
  },
  address: {
    name:{
      type: String
    },
    phone:{
      type:String
    },
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    countryCode: {
      type: String
    },
    zip: {
      type: String
    }
  },
  multipleCategories: {
    type: Array
  },
  reviewsCount: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  rating: {
    type: Object
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  favoriteId: {
    type: Schema.ObjectId,
    ref: 'Favorite'
  },
  deals: [
    {
      name: {
        type: String
      },
      desc: {
        type: String
      },
      discount: {
        type: Number
      }
    }
  ],
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
EntitySchema.statics = {
  /**
   * save and update entity
   * @param entity
   * @returns {Promise<Entity, APIError>}
   */
  save(entity) {
    return entity.save()
      .then((entity) => {
        if (entity) {
          return entity;
        };
        const err = new APIError('Error in entity', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get entity
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((entity) => {
        if (entity) {
          return entity;
        };
        const err = new APIError('No such entity exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List entity in descending order of 'createdAt' timestamp.
   * @returns {Promise<Entity[]>}
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
   * Count of entity records
   * @returns {Promise<Entity[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  findUniqueEntityId(entityId) {
    return this.findOne({
      entityId: entityId,
      active: true
    })
      .exec()
      .then((entity) => entity);
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
 * @typedef Entity
 */
export default mongoose.model('Entity', EntitySchema);
