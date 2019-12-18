import moment from 'moment';
import momentTimezone from 'moment-timezone';
const defaultFormat = 'YYYY-MM-DD';
const defaultYearFormat = 'YYYY';
import config from '../config/config';

function getTodayDate(format = defaultFormat) {
  return moment.utc().format(format);
}

function getYesterdayDate(format = defaultFormat) {
  return moment.utc().format(format);
}

function formatDate(date, format = defaultFormat) {
  return moment(new Date(date)).format(format)
}
function getFutureDate(days, day) {
  let date = moment().add(days, 'days').format(defaultFormat);
  if (day) {
    date = moment(new Date(day)).add(days, 'days').format(defaultFormat);
  }
  return date;
}

function formatYear(date) {
  let year = moment().format(defaultFormat);
  if (year) {
    year = moment(new Date(date)).format(defaultYearFormat);
  }
  return year;
}
function getPerviousMonthsDate(n) {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let firstDay = moment(new Date(y, m - n, d)).format(defaultFormat) + 'T00:00:00Z';
  return new Date(firstDay);
}

function getThisMonthDatesQuery() {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let firstDay = moment(new Date(y, m, 1)).format(defaultFormat) + 'T00:00:00.000Z';
  let lastDay = moment(new Date(y, m + 1, 0)).format(defaultFormat) + 'T23:59:59.000Z';
  let newDate = new Date(y, m, 1);
  return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
}

function getPerviousMonthsDatesQuery(n) {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let firstDay = moment(new Date(y, m - n, 1)).format(defaultFormat) + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m, 0)).format(defaultFormat) + 'T23:59:59Z';
  return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
}
function getExactMonthBackQuery(n) {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let firstDay = moment(new Date(y, m - n, d)).format(defaultFormat) + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m, d)).format(defaultFormat) + 'T23:59:59Z';
  return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
}
function getTimeForDate(date) {
  let startDate = moment(new Date()).format(defaultFormat);
  let endDate = moment(date).format(defaultFormat);
  endDate = moment(endDate, defaultFormat);
  startDate = moment(startDate, defaultFormat);
  let noOfDays = startDate.diff(endDate, 'days');
  if (noOfDays > config.linkExpireDays) {
    return true;
  } else {
    return false;
  };
};
function getMonthsDatesQuery(m) {
  let date = new Date();
  let y = date.getFullYear();
  let firstDay = moment(new Date(y, m, 1)).format(defaultFormat) + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m + 1, 0)).format(defaultFormat) + 'T23:59:59Z';
  return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
}
function getFirstDayOfMonthsDatesQuery(m) {
  let date = new Date();
  let y = date.getFullYear();
  let firstDay = moment(new Date(y, m, 1)).format(defaultFormat) + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m + 1, 0)).format(defaultFormat) + 'T23:59:59Z';
  return { $lte: new Date(firstDay) };
}

function getBalanceDueDate(req) {
  let date = new Date();
  let day = date.getDate();
  if (req.setting) {
    let paymentPeriod = req.setting.payments;
    let startDay;
    if (paymentPeriod === "BiMonthly") {
      if (day <= 15) {
        startDay = 1;
      } else {
        startDay = 16;
      }
    } else {
      startDay = 1
    }
    date.setDate(startDay)

    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDate();
    let firstDay = moment(new Date(y, m, d)).format(defaultFormat) + 'T00:00:00Z';
    let lastDay = moment(new Date(y, m, day)).format(defaultFormat) + 'T23:59:59Z';
    return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
  }
}

function getDifference(start, end) {
  var a = moment(start)
  var b = moment(end)
  var days = a.diff(b, 'days');
  let date1 = start.getDate()
  let date2 = end.getDate()
  if (date1 !== date2 && days === 0) {
    days = 1;
  }
  return days;
}

function getTimestampDate(dat) {
  let date = new Date(dat);
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let newDate = new Date(y, m, d, 0, 0, 0);
  return newDate.getTime() / 1000;
}


function formatUtcDate(date, format = defaultFormat) {
  return moment(new Date(date)).utc().format(format);
}

export default {
  getTodayDate,
  getYesterdayDate,
  getFutureDate,
  formatDate,
  formatYear,
  getThisMonthDatesQuery,
  getPerviousMonthsDatesQuery,
  getTimeForDate,
  getMonthsDatesQuery,
  getFirstDayOfMonthsDatesQuery,
  getExactMonthBackQuery,
  getPerviousMonthsDate,
  getBalanceDueDate,
  getDifference,
  getTimestampDate,
  formatUtcDate
};