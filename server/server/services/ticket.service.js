import Ticket from '../models/ticket.model';

/**
 * set orders variables
 * @returns {orders}
 */
function setCreateTicketVaribles(req, ticket) {
    if (ticket.category === 'Finance') {
        ticket.ticketId = 'F' + parseInt(ticket.ticketNumber);
    } else if (ticket.category === 'Technical') {
        ticket.ticketId = 'T' + parseInt(ticket.ticketNumber);
    } else if (ticket.category === 'Support') {
        ticket.ticketId = 'S' + parseInt(ticket.ticketNumber);
    }

    if (req.tokenInfo && req.tokenInfo._id) {
        if (req.tokenInfo.loginType === 'buyer') {
            ticket.createdBy.buyer = req.tokenInfo._id;
            ticket.userId = req.tokenInfo._id;
            ticket.userName = req.tokenInfo.displayName;
            ticket.createdBy.name = req.tokenInfo.displayName;
        }
        if (req.tokenInfo.loginType === 'seller') {
            ticket.createdBy.seller = req.tokenInfo._id;
            ticket.userId = req.tokenInfo._id;
            ticket.userName = req.tokenInfo.displayName;
            ticket.createdBy.name = req.tokenInfo.displayName;
        }
        if (req.tokenInfo.loginType === 'employee') {
            ticket.createdBy.employee = req.tokenInfo._id;
            ticket.userId = req.tokenInfo._id;
            ticket.userName = req.tokenInfo.displayName;
            ticket.createdBy.name = req.tokenInfo.displayName;
        }
    }
    ticket.status = 'Pending';
    ticket.created = new Date();
    return ticket;
}

export default {
    setCreateTicketVaribles
};