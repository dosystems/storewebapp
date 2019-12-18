import appRoot from 'app-root-path';
import bluebird from 'bluebird';
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import expressWinston from 'express-winston';
import helmet from 'helmet';
import httpStatus from 'http-status';
import logger from 'morgan';
import methodOverride from 'method-override';
import path from 'path';
import redis from 'redis';

import config from './config';
import errorHandler from './errorHandler';
import winstonInstance from './winston';

import routes from '../routes/index.route';
import serviceUtil from '../utils/service.util';

import APIError from '../helpers/APIError';


const app = express();
global.logger = winstonInstance;
if (config.env === 'development') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());


// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.resolve('./server/views'));
// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}
app.use(express.static(path.join(appRoot.path, 'server/upload')));

// remove unknown req.body fields
app.use(serviceUtil.removeBodyFields);

app.use('/api', routes);


app.get('*', (req, res) => {
  res.send('Something went wrong. Please contact our support.');
});

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  return errorHandler(err, req, res, next);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  req.errorMsg = 'API not found';
  return errorHandler('', req, res, next);
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance
  }));
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => // eslint-disable-line no-unused-vars
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {}
  })
);

export default app;
