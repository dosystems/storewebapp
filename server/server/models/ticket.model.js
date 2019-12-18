import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);

const Schema = mongoose.Schema;
const SchemaTypes = mongoose.Schema.Types;

/**
 * Statement Schema
 */
const TicketSchema = new mongoose.Schema({
  subject: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
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
  category: {
    type: String,
    default: ''
  },
  ticketId: {
    type: String,
    default: ''
  },
  ticketNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  userId: {
    type: Schema.ObjectId
  },
  userName: {
    type: String,
    default: ''
  },
  userLastUpdated: {
    type: Date
  },
  adminLastUpdated: {
    type: Date
  },
  assignedTo: {
    type: Schema.ObjectId,
    ref: 'Employee'
  },
  createdBy: {
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: String
  },
  updatedBy: {
    buyer: {
      type: Schema.ObjectId,
      ref: 'Buyer'
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'Seller'
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: String
  },
  comments: [
    {
      message: String,
      postedBy: {
        buyer: {
          type: Schema.ObjectId,
          ref: 'Buyer'
        },
        seller: {
          type: Schema.ObjectId,
          ref: 'Seller'
        },
        employee: {
          type: Schema.ObjectId,
          ref: 'Employee'
        },
        name:String
      },
      created: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

TicketSchema.statics = {

  /**
   * save and update Ticket
   * @param Ticket
   * @returns {Promise<Ticket, APIError>}
   */
  save(ticket) {
    return ticket.save()
      .then((ticket) => {
        if (ticket) {
          return ticket;
        }
        const err = new APIError('error in ticket', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });

  },

  /**
 * List Ticket in descending order of 'createdAt' timestamp.
 * @returns {Promise<ticket[]>}
 */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .populate('createdBy.buyer', 'firstName lastName displayName')
      .populate('createdBy.seller', 'firstName lastName displayName companyName')
      .populate('createdBy.employee', 'firstName lastName displayName profilePic')
      .populate('comments.postedBy.buyer', 'firstName lastName displayName profilePic')
      .populate('comments.postedBy.seller', 'firstName lastName displayName profilePic companyName')
      .populate('comments.postedBy.employee', 'firstName lastName displayName profilePic')
      .populate('assignedTo', 'firstName lastName displayName profilePic')
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
 * Count of ticket records
 * @returns {Promise<ticket[]>}
 */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Get ticket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.buyer', 'firstName lastName displayName')
      .populate('createdBy.seller', 'firstName lastName displayName companyName')
      .populate('createdBy.employee', 'firstName lastName displayName profilePic')
      .populate('comments.postedBy.buyer', 'firstName lastName displayName profilePic')
      .populate('comments.postedBy.seller', 'firstName lastName displayName profilePic companyName')
      .populate('comments.postedBy.employee', 'firstName lastName displayName profilePic')
      .exec()
      .then((ticket) => {
        if (ticket) {
          return ticket;
        }
        const err = new APIError('No such ticket exists', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
  },

  /**
   * Get LastTicket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  getLastTicket() {
    return this.findOne({ 'active': true })
      .sort({ 'created': -1 })
      .exec();
  },

  /**
   * reply to ticket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  replyTicket(req, newvalues) {
    return this.update({ '_id': req.query.ticketId }, newvalues)
      .exec();
  }
}

export default mongoose.model('Ticket', TicketSchema);
