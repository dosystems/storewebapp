import winston from 'winston';
//import httpContext from 'express-http-context';

// TR: console'da sadece hepsi tutuluyor olacak çünkü info log seviyesinden sonra diğer tüm log seviyeleri sıralanmış
// EN: all log level will be shown in Console, because 'info' is on the top of list with 0 value.
var transportConsole = new winston.transports.Console({ json: false, timestamp: true, prettyPrint:true, colorize: true, level:'info' }),

// TR: File'da sadece i ve db tutuluyor olacak çünkü i den sonra db log seviyesi sıralanmış
// EN: 'i' and 'db' log levels will be shown in File, because db is after i and for File transport level is 'i'
transportFileDebug = new winston.transports.File({ filename: 'logs/debug.log', json: true }),
transportFileException = new winston.transports.File({ filename: 'logs/exceptions.log', json: false });

var logger = new (winston.Logger)({
  levels: {
    info: 0,
    warn: 1,
    error: 2,
    verbose: 3,
    i: 4,
    db: 5
  },
  transports: [
    transportConsole,
    transportFileDebug
  ],
  exceptionHandlers: [
    transportConsole,
    transportFileException
  ],
  exitOnError: false
});

winston.addColors({
  info: 'green',
  warn: 'cyan',
  error: 'red',
  verbose: 'blue',
  i: 'gray',
  db: 'magenta'
});


function traceCaller(n) {
  if( isNaN(n) || n<0) n=1;
  n+=1;
  var s = (new Error()).stack
    , a=s.indexOf('\n',5);
  while(n--) {
    a=s.indexOf('\n',a+1);
    if( a<0 ) { a=s.lastIndexOf('\n',s.length); break;}
  }
  let b=s.indexOf('\n',a+1); if( b<0 ) b=s.length;
  a=Math.max(s.lastIndexOf(' ',b), s.lastIndexOf('/',b));
  b=s.lastIndexOf(':',b);
  s=s.substring(a+1,b);
  return s;
}

var formatMessage = function(message) {
//  var reqId = httpContext.get('reqId');
//  message = reqId ? message + " reqId: " + reqId : message;
  return message;
};

//// **help me to add line number**
let logger_info_old = logger.info;
logger.info = function(msg) {
  let fileAndLine = traceCaller(1);
  return logger_info_old(`${fileAndLine}: ${formatMessage(msg)}`);
};

let logger_debug_old = logger.debug;
logger.debug = function(msg) {
  let fileAndLine = traceCaller(1);
  return logger_debug_old(`${fileAndLine}: ${formatMessage(msg)}`);
};

let logger_error_old = logger.error;
logger.error = function(msg) {
  let fileAndLine = traceCaller(1);
  return logger_error_old(`${fileAndLine}: ${formatMessage(msg)}`);
};

let logger_warn_old = logger.warn;
logger.warn = function(msg) {
  let fileAndLine = traceCaller(1);
  return logger_warn_old(`${fileAndLine}: ${formatMessage(msg)}`);
};

let logger_db_old = logger.db;
logger.db = function(msg) {
  let fileAndLine = traceCaller(1);
  return logger_db_old(`${fileAndLine}: ${formatMessage(msg)}`);
};


export default logger;