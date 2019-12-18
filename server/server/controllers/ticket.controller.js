
import mongoose from 'mongoose';

import Ticket from '../models/ticket.model';

import ticketService from '../services/ticket.service';

import i18nUtil from '../utils/i18n.util';
import serviceUtil from '../utils/service.util';
import respUtil from '../utils/resp.util';
import session from '../utils/session.util';


/**
 * Load Ticket and append to req.
 * @param req
 * @param res
 * @param next
 */

async function load(req, res, next) {
  req.ticket = await Ticket.get(req.params.ticketId);
  return next();
}

/**
 * Get ticket
 * @param req
 * @param res
 * @returns {details: ticket}
 */
async function get(req, res) {
  logger.info('Log:Ticket Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let ticket = req.ticket;
  logger.info('Log:ticket Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: ticket
  };

  res.json(responseJson);
}

/**
 * Create new ticket
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  console.log(req.body)
  logger.info('Log:Ticket Controller:create: body :' + JSON.stringify(req.body));
  let ticket = new Ticket(req.body);
  console.log(ticket)
  let lastTicket = await Ticket.getLastTicket();
  if (lastTicket && lastTicket.ticketNumber) {
    ticket.ticketNumber = parseInt(lastTicket.ticketNumber) + 1;
  } else {
    ticket.ticketNumber = '10000';
  }
  ticket = await ticketService.setCreateTicketVaribles(req, ticket);
  console.log(ticket)
  req.ticket = await Ticket.save(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketCreate';
  logger.info('Log:tickets Controller:create:' + i18nUtil.getI18nMessage('ticketCreate'));
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing Ticket
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Ticket Controller:update: body :' + JSON.stringify(req.body));
  let ticket = req.ticket;
  ticket = Object.assign(ticket, req.body);
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'buyer') {
      ticket.updatedBy.buyer = req.tokenInfo._id;
    }
    if (req.tokenInfo.loginType === 'employee') {
      ticket.updatedBy.employee = req.tokenInfo._id;
    }
  }
  ticket.updated = new Date();
  req.ticket = await Ticket.save(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketUpdate';
  logger.info('Log:tickets Controller:update:' + i18nUtil.getI18nMessage('ticketUpdate'));
  res.json(respUtil.updateSuccessResponse(req));
}

/**
* Get ticket list. based on criteria
* @param req
* @param res
* @param next
* @returns {tickets: tickets, pagination: pagination}
*/
async function list(req, res, next) {
  let responseJson = {};
  logger.info('log:Ticket Controller:list:query :' + JSON.stringify(req.query));
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count
    query.pagination.totalCount = await Ticket.totalCount(query);
  }
  //get ticket records
  const tickets = await Ticket.list(query);
  logger.info('Log:tickets Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.tickets = tickets;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
}

/**
 * Delete ticket.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:ticket Controller:remove: query :' + JSON.stringify(req.query));
  const ticket = req.ticket;
  ticket.active = false;
  ticket.updated = Date.now();
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'buyer') {
      ticket.updatedBy.buyer = req.tokenInfo._id;
    }
    if (req.tokenInfo.loginType === 'employee') {
      ticket.updatedBy.employee = req.tokenInfo._id;
    }
  }
  req.ticket = await Ticket.save(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketDelete';
  logger.info('Log:tickets Controller:Delete:' + i18nUtil.getI18nMessage('ticketDelete'));
  res.json(respUtil.removeSuccessResponse(req));
}

/**
 * create reply tickets for existing Ticket
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function createReplyTicketsForTicket(req, res, next) {

  logger.info('Log:Ticket Controller:createReplyTicketsForTicket: body :' + JSON.stringify(req.body));
  let postedByQuery = {};
  if (req && req.query && req.query.ticketId && req.body.comments && req.body.comments[0] && req.body.comments[0].message) {
    if (req.tokenInfo && req.tokenInfo._id) {
      if (req.tokenInfo.loginType === 'buyer') {
        postedByQuery.buyer = req.tokenInfo._id;
        postedByQuery.name = req.tokenInfo.displayName;
      }
      if (req.tokenInfo.loginType === 'employee') {
        postedByQuery.employee = req.tokenInfo._id;
        postedByQuery.name = req.tokenInfo.displayName;
      }
    }
  }

  let newvalues = {
    $push: {
      comments: {
        $each: [{ _id: mongoose.Types.ObjectId(), message: req.body.comments[0].message, postedBy: postedByQuery }]
      }
    }
  };
  newvalues.updated = new Date();

  if (req.tokenInfo && req.tokenInfo._id) {
    newvalues.updatedBy = {}
    if (req.tokenInfo.loginType === 'buyer') {
      newvalues.buyerLastUpdated = new Date();
      newvalues.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
      newvalues.updatedBy.name = session.getSessionLoginName(req);
    }
    if (req.tokenInfo.loginType === 'employee') {
      newvalues.adminLastUpdated = new Date();
      newvalues.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
      newvalues.updatedBy.name = session.getSessionLoginName(req);
    }
  }

  req.ticket = await Ticket.replyTicket(req, newvalues);
  req.entityType = 'ticket';
  req.activityKey = 'ticketUpdate';
  logger.info('Log:tickets Controller:createReplyTicketsForTicket:' + i18nUtil.getI18nMessage('ticketUpdate'));
  res.json(respUtil.updateSuccessResponse(req));
};


export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  createReplyTicketsForTicket
};