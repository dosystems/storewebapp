import express from 'express';
import validate from 'express-validation';
import ticketCtrl from '../controllers/ticket.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/createReplyTicketsForTicket').all(authPolicy.isAllowed)
  .post(asyncHandler(ticketCtrl.createReplyTicketsForTicket));

router.route('/').all(authPolicy.isAllowed)

  /** POST /api/tickets - Create new tickets */
  .post(asyncHandler(ticketCtrl.create))

  /** get /api/tickets -  get all tickets */
  .get(asyncHandler(ticketCtrl.list));

router.route('/:ticketId').all(authPolicy.isAllowed)

  /** get /api/tickets -  get one tickets using id*/
  .get(asyncHandler(ticketCtrl.get))

/** put /api/tickets -  update tickets */
     .put( asyncHandler(ticketCtrl.update))

     /** delete /api/tickets -  delete tickets */
     .delete(asyncHandler(ticketCtrl.remove));

router.param('ticketId', asyncHandler(ticketCtrl.load));

export default router;
