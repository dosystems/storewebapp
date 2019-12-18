import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;

/**
 * Order Schema
 */
const OrderSchema = new mongoose.Schema({
  userId: {
    type: Schema.ObjectId,
    ref: "Buyer"
  },
  userName: {
    type: String
  },
  ownerId: {
    type: Schema.ObjectId,
    ref: "Seller"
  },
  ownerName: {
    type: String
  },
  orderId: {
    type: String
  },
  entityId: {
    type: Schema.ObjectId,
    ref: "Entity"
  },
  entityName: {
    type: String
  },
  category: {
    type: String
  },
  multipleCategories: {
    type: String
  },
  invoiceNo: {
    type: String
  },
  inventory: {
    type: Object
  },
  couponApplied:{
    type: String
  },
  currencies: {
    type: Array
  },
  entityCode:{
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String
  },
  returnStatus: {
    type: String
  },
  promocode:{
    type: String
  },
  promocodeId:{
    type:String
  },
  discount:{
    type:String
  },
  shippingFrom: {
    name: {
      type: String
    },
    phone: {
      type: String
    },
    street: {
      type: String
    },
    city: {
      type: String
    },
    zip: {
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
    }
  },
  shipmentAddress: {
    name: {
      type: String
    },
    phone: {
      type: String
    },
    street: {
      type: String
    },
    city: {
      type: String
    },
    zip: {
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
    active: {
      type: Boolean,
      defult: true
    }
  },
  orderdOn: {
    type: Date
  },
  quantity: {
    type: Number
  },
  buxPercentage: {
    type: Number
  },
  euroPercentage: {
    type: Number
  },
  shippingRateDetails: {
    type: Object
  },
  shippingRateCurrencies:{
    type:Array
  },
  deliveryDate: {
    type: Date
  },
  deliveryDays: {
    type: String
  },
  shippingCharges: {
    type: Number
  },
  adminCommission:{
    type: Number
  },
  BUX: {
    type: Number
  },
  EUR: {
    type: Number
  },
  euroToBux: {
    type: Number
  },
  totalPrice: {
    type: Number
  },
  payments: {
    type: Object
  },
  purchased: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  isReturnable: {
    type: Boolean
  },
  cancelled:{
    type:Date
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
  },
  images: {
    type: Array
  },
  productName: {
    type: String
  },
  productId: {
    type: Schema.ObjectId,
    ref: "Entity"
  }
});

/**
 * Statics
 */
OrderSchema.statics = {
  /**
   * save and update order
   * @param order
   * @returns {Promise<Order, APIError>}
   */
  save(order) {
    return order.save()
      .then((order) => {
        if (order) {
          return order;
        };
        const err = new APIError('Error in order', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get order
   * @param {ObjectId} id - The objectId of order.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        };
        const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List order in descending order of 'createdAt' timestamp.
   * @returns {Promise<Order[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .populate('createdBy.buyer', 'displayName')
      .populate('updatedBy.buyer', 'displayName')
      .populate('createdBy.seller', 'displayName companyName')
      .populate('updatedBy.seller', 'displayName companyName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
   * Count of order records
   * @returns {Promise<Order[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },
  totalQuantity(query) {
    return this.aggregate([{ $match: query.filter }, { $group: { _id: null, sum: { $sum: "$quantity" } } }]);
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
 * @typedef Order
 */
export default mongoose.model('Order', OrderSchema);
