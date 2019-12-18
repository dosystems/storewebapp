import config from '../config/config';
import twilio from 'twilio';

let twilioSms;

// twilio configuration sid and authtoken
if (config && config.twilioConfig && config.twilioConfig.accountSid && config.twilioConfig.authToken) {
  twilioSms = twilio(config.twilioConfig.accountSid, config.twilioConfig.authToken);
}

/**
 * send sms
 * @param req
 * @param res
 */

function sendSms(req, res) {
  if (req && req.user && req.user.phone && config && config.twilioConfig && config.twilioConfig.from) {
    let messageBody;
    if (req && req.user && req.user.verificationCode) {
      messageBody = req.user.verificationCode;
    }

    if (req && req.messageBody) {
      messageBody = req.messageBody;
    }

    if (config.twilioConfig.countryCode) {
      req.user.phone = req.user.phone.replace(/[- )(]/g, '');
      if (req.user.phone.indexOf('+1') === -1) {
        req.user.phone = config.twilioConfig.countryCode + req.user.phone;
      }
    }

    twilioSms.messages.create({
      to: req.user.phone,
      from: config.twilioConfig.from,
      body: messageBody
    }, function (err, message) {
      if (err) {
        logger.error('Error:Sms service:sendEmail: error ' + err);
      } else {
        logger.info('Log:Sms service:sendEmail: success: Login code Sms sent successfully.');
      }
    });
  }
}

/**
 * send otp from voice
 * @param req
 * @param res
 */

function sendOtpFromVoice(req, res) {
  if (req && config && config.twilioConfig && config.twilioConfig.from) {
    if (req.user.phone && req.user.verificationCode) {
      let number = req.user.verificationCode.toString();

      let voiceTextCode = '<Response><Say voice="woman">Your OTP code is: </Say> ';

      for (let i = 0, len = number.length; i < len; i += 1) {
        if (number.charAt(i) === '0') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> zero </Say> ';
        };
        if (number.charAt(i) === '1') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> one </Say> ';
        };
        if (number.charAt(i) === '2') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> two </Say> ';
        };
        if (number.charAt(i) === '3') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> three </Say> ';
        };
        if (number.charAt(i) === '4') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> four </Say> ';
        }
        if (number.charAt(i) === '5') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> five </Say> ';
        };
        if (number.charAt(i) === '6') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> six </Say> ';
        };
        if (number.charAt(i) === '7') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> seven </Say> ';
        };
        if (number.charAt(i) === '8') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> eight </Say> ';
        };
        if (number.charAt(i) === '9') {
          voiceTextCode += '<Pause length="1"/> <Say voice="woman"> nine </Say> ';
        };
      };
      voiceTextCode += '</Response>';
      let voiceUrlCode = encodeURIComponent(voiceTextCode);
      if (config && config.twilioConfig && config.twilioConfig.countryCode) {
        req.user.phone = req.user.phone.replace(/[- )(]/g, '');
        if (req.user.phone.indexOf('+1') === -1) {
          req.user.phone = config.twilioConfig.countryCode + req.user.phone;
        };
      };
      twilioSms.calls.create({
        url: config.twilioConfig.twilioTwimletsUrl + voiceUrlCode,
        to: req.user.phone,
        from: config.twilioConfig.from
      }, function (err, call) {
        if (err) {
          logger.error('Error:Voice service:sendOtpFromVoice: error ' + err);
        } else {
          logger.info('Log:Voice service:sendOtpFromVoice: success: Login code from Voice sent successfully.');
        };
      });
    }
  };
};

export default {
  sendOtpFromVoice,
  sendSms
};
