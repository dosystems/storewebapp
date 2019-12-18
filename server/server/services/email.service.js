import config from '../config/config';
import nodemailer from 'nodemailer';
import ses from 'node-ses';

// initialize smtp taransport 
let smtpTransport;
if (config && config.mailSettings && config.mailSettings.mailType) {
  if (config.mailSettings.mailType === 'ses') {
    if (config.mailSettings.sesEmailSettings && config.mailSettings.sesEmailSettings.key && config.mailSettings.sesEmailSettings.secret) {
      smtpTransport = ses.createClient({
        key: config.mailSettings.sesEmailSettings.key,
        secret: config.mailSettings.sesEmailSettings.secret
      });
    };
  } else if (config.mailSettings.mailType === 'smtp') {
    if (config.mailSettings.smtpOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.smtpOptions);
    }
  } else if (config.mailSettings.mailType === 'gmail') {
    if (config.mailSettings.gmailOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.gmailOptions);
    }
  } else if (config.mailSettings.mailType === 'zoho') {
    if (config.mailSettings.zohoEmailOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.zohoEmailOptions);
    };
  };
};

/**
 * send Email
 * @param req
 */

async function sendEmail(req) {
  if (req.mailOptions && smtpTransport && config && config.mailSettings && config.mailSettings.activateMails) {
    smtpTransport.sendMail(req.mailOptions, async function (err) {
      if (err) {
        logger.error('Error:Email service:sendEmail: error ' + err);
      } else {
        await logger.info('Log:Email service:sendEmail: success: Email sent successfully.');
      };
    });
  };
};

export default {
  sendEmail
};
