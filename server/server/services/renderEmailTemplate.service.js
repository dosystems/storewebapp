import cons from 'consolidate';
import emailService from '../services/email.service';
import config from '../config/config';
import dateUtil from '../utils/date.util';
import pdfService from '../services/pdf.service';

/**
 * set email options to before send email
 * @param req
 * @param res
 */
async function setEmailOptionsBeforeSendEmail(req, res) {
  let mailOptions = {
    to: req.templateInfo.email,
    from: config.mailSettings.from,
    subject: req.templateInfo.subject,
    html: req.emailHTML
  };
  if (req.templateInfo.emails && req.templateInfo.emails.length > 0) {
    mailOptions.bcc = req.templateInfo.emails
  }
  req.mailOptions = mailOptions;
  await emailService.sendEmail(req);
};

/**
 * set Render Email Template
 * @param req
 * @param res
 */
async function setRenderEmailTemplate(req, res) {
  // cons.swig(config.viewsExtension + req.emailTemplatePath, {
  //   templateInfo: req.templateInfo
  // })
  //   .then(async function (emailHTML) {
  //     req.emailHTML = emailHTML;
  //     await setEmailOptionsBeforeSendEmail(req, res);
  //   })
  //   .catch(function (err) {
  //     throw err;
  //   });
  res.render(req.emailTemplatePath, {
    templateInfo: req.templateInfo
  }, function (err, emailHTML) {
    if (emailHTML) {
      req.emailHTML = emailHTML;
      setEmailOptionsBeforeSendEmail(req, res);
    } else {
      return;
    }
  });
};

/**
 * set Common Email Variables
 * @param req
 * @param res
 */
async function setCommonEmailVariables(req, res) {
  if (config && config.mailSettings) {
    req.emailTemplatePath = '';
    let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));
    if (req.enEmail && req.activityKey === 'employeeForgotPassword') {
      templateInfo.url = templateInfo.adminUrl + 'resetPassword/' + req.enEmail;
      req.emailTemplatePath = 'employee-forgotpassword';
      templateInfo.subject = 'Your password has been reset '
    } else if (req.enEmail && req.activityKey === 'buyerForgotPassword') {
      templateInfo.url = templateInfo.clientUrl + 'resetPassword/' + req.enEmail;
      req.emailTemplatePath = 'buyer-forgotpassword';
      templateInfo.subject = 'Your password has been reset';
    } else if (req.enEmail && req.activityKey === 'sellerForgotPassword') {
      templateInfo.url = templateInfo.vendorUrl + 'resetPassword/' + req.enEmail;
      req.emailTemplatePath = 'seller-forgotpassword';
      templateInfo.subject = 'Your password has been reset';
    } else if (req.enEmail && (req.activityKey === 'employeeCreate') || (req.activityKey === 'employeeUpdate')) {
      templateInfo.url = templateInfo.adminUrl + 'verifysms/' + req.enEmail + '/active';
      req.emailTemplatePath = 'employee-welcome';
      templateInfo.subject = 'Employee account activation';
    } else if (req.entityType && req.activityKey === 'employeeLoginOTP') {
      templateInfo.verificationCode = req[req.entityType].verificationCode;
      req.emailTemplatePath = 'login-code.html';
    } else if (req.entityType && req.activityKey === 'buyerOrderConfirm') {
      req.emailTemplatePath = 'buyer-orderconfirm';
      templateInfo.subject = 'Customer order confirm';
    } else if (req.entityType && req.activityKey === 'sellerOrderConfirm') {
      req.emailTemplatePath = 'seller-orderconfirm';
      templateInfo.subject = 'Merchant order confirm';
    } else if (req.entityType && req.activityKey === 'buyerCreate') {
      templateInfo.url = templateInfo.clientUrl + 'activateEmail/' + req.buyer._id;
      req.emailTemplatePath = 'buyer-create';
      templateInfo.subject = 'Customer account activation';
    } else if (req.entityType && req.activityKey === 'sellerCreate') {
      templateInfo.url = templateInfo.vendorUrl + 'activateEmail/' + req.seller._id;
      req.emailTemplatePath = 'seller-create';
      templateInfo.subject = 'Merchant account activation';
    } else if (req.entityType && req.activityKey === 'sellerApproval') {
      templateInfo.url = templateInfo.vendorUrl;
      req.emailTemplatePath = 'seller-approval';
      templateInfo.subject = 'Merchant account details';
      templateInfo.status = req.seller.status;
    } else if (req.entityType && req.activityKey === 'buyerOrderReturned') {
      req.emailTemplatePath = 'buyer-orderreturned';
      templateInfo.subject = 'Customer order return';
      templateInfo.temUrl = config.mailSettings.clientUrl;
    } else if (req.entityType && req.activityKey === 'buyerOrderCancelled') {
      req.emailTemplatePath = 'buyer-ordercancel';
      templateInfo.subject = 'Customer order cancel';
    } else if (req.entityType && req.activityKey === 'buyerOrderUpdate') {
      req.emailTemplatePath = 'buyer-orderUpdates';
      templateInfo.subject = 'Customer order information';
    } else if (req.entityType && req.activityKey === 'sellerOrderReturned') {
      req.emailTemplatePath = 'seller-orderreturned';
      templateInfo.subject = 'Merchant order return';
    } else if (req.entityType && req.activityKey === 'sellerOrderReturned') {
      req.emailTemplatePath = 'seller-ordercancel';
      templateInfo.subject = 'order return';
    }
    else if (req.entityType && req.activityKey === 'orderDelivered') {
      req.emailTemplatePath = 'orderdeliver-response';
      templateInfo.subject = 'Order delivered';
    } else if (req.entityType && req.activityKey === 'newsLetterCreate') {
      req.emailTemplatePath = "newsLetter-subscribe";
      templateInfo.subject = 'news letter';
    } else if (req.entityType && req.activityKey === 'categoryRequestUpdate') {
      req.emailTemplatePath = 'categoryCreate-request';
      templateInfo.subject = 'Category requested';
    } else if (req.activityKey === "securityForBuy" && req.entityType === 'admin') {
      req.emailTemplatePath = 'buyersDetails';
      templateInfo.subject = 'More Price Orders';
      templateInfo.email = config.email;
      templateInfo.amount = req.amount;
      if(req.orderId && req.orderId.length>0){
        for(let id of req.orderId){
          templateInfo.orderId = req.orderId +" ";
        }
      }
      
      templateInfo.userId = req.userId;
      templateInfo.userName = req.userName;
      templateInfo.amount = req.amount;
      templateInfo.ip = req.ipadd;
 
    }
    else if (req.entityType && req.activityKey === 'subscriptionMail') {
      req.emailTemplatePath = 'packSubscription';
    }



    if (req.entityType == 'employee') {
      templateInfo.name = req[req.entityType] ? req[req.entityType].displayName : '';
      templateInfo.email = req[req.entityType] ? req[req.entityType].email : '';
      templateInfo.password = req.password;
    };
    if (req.entityType == 'buyer') {
      templateInfo.name = req[req.entityType] ? req[req.entityType].displayName : '';
      templateInfo.email = req[req.entityType] ? req[req.entityType].email : '';

      if (req.orderDetails) {
        templateInfo.orderDetails = req.orderDetails;
        templateInfo.created = dateUtil.formatDate(req.orderDetails[0].created, "dddd, MMMM D ,YYYY");
        templateInfo.deliveryDate = dateUtil.formatDate(req.orderDetails[0].deliveryDate, "dddd, MMMM D ,YYYY");
        for (let order of templateInfo.orderDetails) {
          order.images[0] = templateInfo.imageUrl + order.images[0];
        }
        req.templateInfo = templateInfo
        pdfService.createPdfFile(req)
        templateInfo.invoice = templateInfo.pdfUrl + req.fileName;
      }
      if (req.order) {
        templateInfo.status = req.order.status;
        templateInfo.orderName = req.order.entityName;
        templateInfo.userName = req.order.userName;
        templateInfo.price = parseFloat(req.order.BUX.toFixed(2));
        templateInfo.charges = parseFloat(req.order.shippingCharges.toFixed(2));
        templateInfo.amount = parseFloat(req.order.totalPrice.toFixed(2));
        templateInfo.quantity = req.order.quantity;
        templateInfo.image = templateInfo.imageUrl + req.order.images[0];
        templateInfo.invoiceNo = req.order.invoiceNo;
        templateInfo.shipping = req.order.shipmentAddress;
        templateInfo.deliveryDate = dateUtil.formatDate(req.order.deliveryDate, "dddd, MMMM D ,YYYY");
        templateInfo.purchasedOn = dateUtil.formatDate(req.order.purchased, "dddd, MMMM D ,YYYY");
      }


    };
    if (req.entityType == 'seller') {
      templateInfo.name = req[req.entityType] ? req[req.entityType].displayName : '';
      templateInfo.email = req[req.entityType] ? req[req.entityType].email : '';
      if (req.order) {
        templateInfo.orderName = req.order.entityName;
        templateInfo.userName = req.order.userName;
        templateInfo.amount = req.order.totalPrice;
        templateInfo.quantity = req.order.quantity;
        templateInfo.image = templateInfo.imageUrl + req.order.images[0];
        templateInfo.invoiceNo = req.order.invoiceNo;
        templateInfo.shipping = req.order.shipmentAddress;
      }
    };
    if (req.entityType === "newsLetter") {
      if (req.emails && req.emails.length > 0) {
        templateInfo.email = req.emails[0]
        templateInfo.emails = req.emails;
        templateInfo.data = req.newsLetter.data;
      }
    }
    if (req.entityType === "categoryRequest") {
      templateInfo.name = req.seller.name;
      templateInfo.email = req.seller.email;
      templateInfo.status = req.categoryRequest.status;
      templateInfo.category = req.categoryRequest.category
      if (req.body.reason && req.categoryRequest.status === "Rejected") {
        templateInfo.reason = req.body.reason;
      }
    }
    if (req.entityType === "subscription") {
      templateInfo.name = req.subscription.sellerName;
      templateInfo.email = req.subscription.email;
      templateInfo.planName = req.subscription.planName;
      templateInfo.endDate = dateUtil.formatDate(req.subscription.endDate, "dddd, MMMM D ,YYYY")
      templateInfo.planId = req.subscription.planId;
      templateInfo.created = dateUtil.formatDate(req.subscription.created, "dddd, MMMM D ,YYYY")
    }
    // templateInfo.subject = config.mailSettings.websiteName;
    req.templateInfo = templateInfo;
    await setRenderEmailTemplate(req, res);
  };
};

export default {
  setCommonEmailVariables
};
