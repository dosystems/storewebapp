import cron from 'node-cron';
import session from '../utils/session.util';
import Subscription from '../models/subscription.model';
import dateUtil from '../utils/date.util';
import config from '../config/config';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
/**
 * set Subscription variables
 * @returns {Subscription}
 */
async function setCreateSubscriptionVaribles(req, subscription) {
  if (req.tokenInfo) {
    subscription.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    subscription.createdBy.name = session.getSessionLoginName(req);
    subscription.sellerName = session.getSessionLoginName(req);
    subscription.sellerId = session.getSessionLoginID(req);
    subscription.email = session.getSessionLoginEmail(req);
    subscription.phone = session.getSessionLoginPhone(req);
  };

  //adds the plan details in the subscription
  if (req.planDetails) {
    subscription.planName = req.planDetails.name;
    subscription.actualAmount = req.planDetails.price;
    subscription.description = req.planDetails.description;
    subscription.duration = req.planDetails.duration;
  }

  //set the subscription start and end date bases on the plan duration
  if (subscription.duration) {
    subscription.startDate = new Date();
    subscription.endDate = new Date();
    subscription.endDate.setMonth(subscription.endDate.getMonth() + subscription.duration)
  }
  return subscription;
};

/**
 * set Subscription update variables
 * @returns {Subscription}
 */
function setUpdateSubscriptionVaribles(req, subscription) {
  subscription.updated = Date.now();
  if (req.tokenInfo) {
    subscription.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    subscription.createdBy.name = session.getSessionLoginName(req);
  };
  return subscription;
};


/**
 * subscription expiry alert emails
 */



cron.schedule('0 6 * * *', function () {
  // sendSubscriptionExpireMail(req, res);

  var request = require("request");

  var options = {
    method: 'GET',
    url: 'http://localhost:5900/api/subscriptions/sendSubscriptionExpireMail',
    headers:
    {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });

});

async function sendMails(req, res) {
  console.log("poopopopo")
  // req.email =[];
  let weekDate = dateUtil.getFutureDate(7)

  let twoDaysDate = dateUtil.getFutureDate(2);
  console.log(twoDaysDate)
  let weekQuery = {
    active: true,
    endDate: {
      $gte: weekDate + config.dayRanges.start,
      $lte: weekDate + config.dayRanges.end
    }
  }
  let daysQuery = {
    active: true,
    endDate: {
      $gte: twoDaysDate + config.dayRanges.start,
      $lte: twoDaysDate + config.dayRanges.end
    }
  }
  let weekSubscriptions = await Subscription.find(weekQuery);
  req.entityType = 'subscription';
  req.activityKey = 'subscriptionMail'
  if (weekSubscriptions && weekSubscriptions.length > 0) {
    for (let subscription of weekSubscriptions) {
      req.subscription = subscription
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    }
  }
  let daysSubscriptions = await Subscription.find(daysQuery);
  req.entityType = 'subscription';
  req.activityKey = 'subscriptionMail'
  if (daysSubscriptions && daysSubscriptions.length > 0) {
    for (let subscription of daysSubscriptions) {
      req.subscription = subscription
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    }
  }
}

export default {
  setCreateSubscriptionVaribles,
  setUpdateSubscriptionVaribles,
  sendMails
};
