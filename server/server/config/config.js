import Joi from 'joi';
import emailConfig from './extra/email.config';
import smsConfig from './extra/sms.config';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  SERVER_PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017)
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
};
let config = {
  env: envVars.NODE_ENV,
  port: envVars.SERVER_PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: "0a6b944d-d2fb-46fc-a85e-0295c986cd9f",
  // buxUrl:"https://api.bitsolives.com/api/",   //live
  buxUrl: "http://crmserver.nonstopfx.com/api/",  //test
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT,
    test: "mongodb://localhost:27017/ross_test"
  },
  roles: {
    superAdmin: "Super Admin",
    admin: "Admin"
  },
  commonRole: {
    employee: 'employee',
    buyer: "buyer",
    seller: "seller"
  },
  commonStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
    Pending: 'Pending',
    Disabled: 'Disabled',
    Completed: "Completed",
    Suspend: 'Suspend',
    NotVerified: 'NotVerified',
    Verified: 'Verified',
    Rejected: 'Rejected',
    Blocked: 'Blocked'
  },
  email:"buxsuperstore@gmail.com",
  shipmentFileds: {
    customs: {
      "contents": "documents",
      "customs_items": [
        {
          "description": "letter",
          "quantity": 1,
          "value": 1.0,
          "harmonized_tariff_code": "4817.20",
          "country_of_origin": "UK"
        }
      ],
      "non_delivery": "treat_as_abandoned"
    }
  },
  orderStatus: {
    addToCart: "AddToCart",
    buy: "Buy",
    paid: "Paid",
    processing: 'Processing',
    shipped: "Shipped",
    delivered: "Delivered",
    returned: "Returned",
    cancelled: "Cancelled",
    returnRequested: "ReturnRequest",
    completed: "Completed",
    refunded: "Refunded"
  },
  statementType: {
    seller: {
      order: "SOLD",
      return: "RETURN ",
      payment: "PAYMENTRECIVED"
    },
    buyer: {
      order: "EXPENSE",
      return: "RETURNORDER"
    },
    superAdmin: {
      order: "INCOME",
      return: "EXPENSE",
      payment: "PAYMENT"
    }
  },
  returnOrderStatus: {
    returnRequested: "ReturnRequest",
    processing: "Processing",
    pickedUp: "PickedUp",
    returned: "Returned"
  },
  commonDevices: {
    ios: 'ios',
    android: 'android',
    web: 'web'
  },
  upload: {
    employee: "server/upload/employee/",
    entity: "server/upload/entity",
    bulkUpload: "server/upload/bulkUploads",
    employeeDuplicates: "server/upload/employeeDuplicates",
    announcement: "server/upload/announcement",
    sizeChart: "server/upload/sizeChart",
    seller: "server/upload/seller",
    newsLetter: "server/upload/newsLetter",
    pdf: "server/upload/pdf/",
    fonts: 'server/upload/fonts/'
  },
  limit: 2000,
  page: 1,
  sortfield: 'created',
  direction: 'desc',
  expireTokenTime: 5184000000,
  isTokenNotPassed: true,
  commonOTPAllowed: false,
  commonOTPNumber: 999999,
  viewsExtension: 'server/views/',
  streamName: 'forewarn-dev',
  isAccessServer: false,
  randomLimits: {
    max: 999999,
    min: 100000
  },
  dayRanges: {
    start: 'T00:00:00Z',
    end: "T23:59:59Z"
  },
  urls: {
    ratesUrl: "http://api2.grandfinex.com/api/exchangerates"
  },
  awsRegion: 'us-east-1',
  secret: 'secret',
  uploadImageSizes: [
    {
      path: 's',
      width: 100,
      height: 124
    },
    {
      path: 'm',
      width: 386,
      height: 480
    },
    {
      path: 'l',
      width: 772,
      height: 960
    }
  ]
};

config = Object.assign(config, emailConfig, smsConfig);

export default config;
