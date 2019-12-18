import config from '../config/config';
import dateUtil from '../utils/date.util';

/**
 * Monthly wise reports Generating
 * @param {*} countVariable 
 */
function lastFourMonthsCount(countVariable) {
  let monthsOfCount = 3;
  let date = new Date();
  let currentMonth = date.getMonth();
  let chartCounts = [];
  for (let i = currentMonth - monthsOfCount; i <= currentMonth; i++) {
    let count = 0;
    if (countVariable && countVariable.length > 0) {
      for (let obj of countVariable) {
        
        if (obj && obj._id && obj._id.month && obj._id.month === i+1) {
          chartCounts.push({ "month": i+1, "count": obj.count })
          count++;
        }
      }
      if (count === 0) {
        chartCounts.push({ "month": i + 1, "count": 0 })
      }
    }
  }
  return chartCounts;
}


/**
 * day wise reports generating
 * @param {*} countVariable 
 */
function monthlyDayCount(countVariable) {
  let date = new Date();
  let lastOneMonthsDate = dateUtil.getPerviousMonthsDate(1);
  let chartCounts = [];
  let count = 0
  for (lastOneMonthsDate; lastOneMonthsDate <= date; lastOneMonthsDate.setDate(lastOneMonthsDate.getDate() + 1)) {
    let count = 0;
    if (countVariable && countVariable.length > 0) {
      for (let obj of countVariable) {
        if (obj && obj._id && obj._id.day && obj._id.day === lastOneMonthsDate.getDate()) {
          chartCounts.push({ "day": obj._id.day, "count": obj.count })
          count++;
        }
      }
      if (count === 0) {
        chartCounts.push({ "day": lastOneMonthsDate.getDate(), "count": 0 })
      }
    }
  }

  return chartCounts;
}

/**
 * calculating payment Summary of vendor
 * @param {*} paymentStatements 
 */
function getPaymentSummary(paymentStatements) {
  let total = 0;
  if (paymentStatements.length > 0) {
    for (let paymentStatement of paymentStatements) {
      if (paymentStatement._id === config.statementType.seller.order) {
        total += paymentStatement.totalAmount;
      } else if (paymentStatement._id === config.statementType.seller.return) {
        total -= paymentStatement.totalAmount
      }
    }
  }
  return total;
}

export default {
  lastFourMonthsCount,
  monthlyDayCount,
  getPaymentSummary
}