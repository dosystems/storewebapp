import dateUtil from "./date.util";
import config from '../config/config';
import mongoose from 'mongoose'
/**
 * generateQuery 
 * @param req 
 */
function generateQuery(req) {
  let dashboardQuery = {};
  let todayDate = dateUtil.getTodayDate();
  let weekDate = dateUtil.getFutureDate(-6);
  let lastThirtyDaysDate = dateUtil.getExactMonthBackQuery(1);
  let currentMonthsDate = dateUtil.getThisMonthDatesQuery();
  let lastOneMonthsDate = dateUtil.getPerviousMonthsDatesQuery(1);
  let lastFourMonthsDate = dateUtil.getExactMonthBackQuery(4);
  let lastSixMonthsDate = dateUtil.getPerviousMonthsDatesQuery(6);
  let yearMonthsDate = dateUtil.getPerviousMonthsDatesQuery(11);
  let paymentPeriod = dateUtil.getBalanceDueDate(req);

  //query to get all orders count
  dashboardQuery.allOrdersQuery = {
    filter: {
      status: config.orderStatus.paid
    }
  };

  // query to get all active orders count
  dashboardQuery.activeOrdersQuery = {
    filter: {
      active: true,
      status: {
        $nin: [config.orderStatus.addToCart,
        config.orderStatus.cancelled,
        config.orderStatus.returned,
        config.orderStatus.refunded
        ]
      }
    }
  };

  //query to get active buyers count
  dashboardQuery.activeBuyersQuery = {
    filter: {
      active: true,
    }
  };

  //query to get active sellers count
  dashboardQuery.activeSellersQuery = {
    filter: {
      active: true
    }
  };

  //query to get this week order count
  dashboardQuery.thisWeekOrderQuery = {
    filter: {
      active: true,
      status: config.orderStatus.paid,
      created: {
        $gte: new Date(weekDate + config.dayRanges.start),
        $lte: new Date(todayDate + config.dayRanges.end)
      }
    }
  };
  dashboardQuery.totalProductCount = {
    filter: {
      active: true
    }
  }
  dashboardQuery.sellersCountQuery = {
    filter: [
      {
        $match: {
          active: true,
          created: lastFourMonthsDate,
        }
      },
      {
        $group: {
          _id: { month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 }
        }
      }
    ]
  };
  dashboardQuery.buyersCountQuery = {
    filter: [
      {
        $match: {
          active: true,
          created: lastFourMonthsDate,
        }
      },
      {
        $group: {
          _id: { month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 }
        }
      }
    ]
  }
  dashboardQuery.ordersMonthsQuery = {
    filter: [
      {
        $match: {
          active: true,
          created: lastFourMonthsDate,
          status: {
            $nin: [config.orderStatus.addToCart,
            config.orderStatus.refunded,
            config.orderStatus.cancelled,
            config.orderStatus.returned
            ]
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]
  }
  dashboardQuery.lastThirtyDaysQuery = {
    filter: [
      {
        $match: {
          active: true,
          created: {
            $gte: new Date(lastThirtyDaysDate + config.dayRanges.start),
            $lte: new Date(todayDate + config.dayRanges.end)
          },
          status: config.orderStatus.paid
        }
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$created" }, month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 },
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]
  }
  dashboardQuery.bestSellerQuery = {
    filter: [
      { $match: { active: true, status: "Paid" } },
      {
        $group:
        {
          _id: { ownerId: "$ownerId", name: "$ownerName" },
          totalAmount: { $sum: "$BUX" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "totalAmount": -1 } }
    ]
  };



  //queries for vandor records

  //query to get orders count recived by vendor
  dashboardQuery.vendorRecivedOrdersQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id
        }
      }, {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
    ]
  }

  //query to get today sales  amount and quantity
  dashboardQuery.todaySalesQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
          purchased: {
            $gte: new Date(todayDate + config.dayRanges.start),
            $lte: new Date(todayDate + config.dayRanges.end)
          },
        }
      }, {
        $group: {
          _id: "",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }
  //query to get week sales amount and quantity
  dashboardQuery.weekSalesQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
          purchased: {
            $gte: new Date(weekDate + config.dayRanges.start),
            $lte: new Date(todayDate + config.dayRanges.start)
          },
        }
      }, {
        $group: {
          _id: "",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }

  //query to get currentmonth sales amount and quantity
  dashboardQuery.currentMonthSalesQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
          purchased: currentMonthsDate
        }
      }, {
        $group: {
          _id: "",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }

  //query to get month sales amount and quantity
  dashboardQuery.lastMonthSalesQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
          purchased: lastOneMonthsDate
        }
      }, {
        $group: {
          _id: "",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }

  //query to get six months sales amount and quantity
  dashboardQuery.sixMonthSalesQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
          purchased: lastSixMonthsDate
        }
      }, {
        $group: {
          _id: "",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }
  //query for get buyers list of vendor
  dashboardQuery.buyersQuery = {
    filter: [
      {
        $match: {
          ownerId: req.tokenInfo._id,
          active: true,
          created: lastFourMonthsDate,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          },
        }
      },
      {
        $group: {
          _id: { "month": { $month: "$created" }, "year": { $year: "$created" }, userId: "$userId" }

        }
      }, {
        $group: {
          _id: { "month": "$_id.month"},
          count: { $sum: 1 }
        }
      }
    ]
  };

  //query for get products count of vendor
  dashboardQuery.vendorProductsQuery = {
    filter: [
      {
        $match: {
          ownerId: req.tokenInfo._id,
          active: true
        }
      },
      {
        $group: {
          _id: " ",
          count: { $sum: "$totalAvailable" }
        }
      }
    ]
  }

  //query for get country wise sales
  dashboardQuery.salesByCountryQuery = {
    filter: [
      {
        $match: {
          ownerId: req.tokenInfo._id,
          active: true,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          }
        }
      },
      {
        $group: {
          _id: { "ownerId": "$ownerId", "country": "$shipmentAddress.country" },
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" },
        }
      }
    ]
  }
  //query for get Year sales by monthly
  dashboardQuery.vendorOrdersMonthsQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          created: lastFourMonthsDate,
          status: {
            $nin: [
              config.orderStatus.addToCart,
              config.orderStatus.cancelled,
              config.orderStatus.refunded,
              config.orderStatus.returned
            ]
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]
  }

  dashboardQuery.vendorOrderslastThirtyDaysQuery = {
    filter: [
      {
        $match: {
          active: true,
          ownerId: req.tokenInfo._id,
          created: {
            $gte: new Date(lastThirtyDaysDate + config.dayRanges.start),
            $lte: new Date(todayDate + config.dayRanges.end)
          },
          status: config.orderStatus.paid
        }
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$created" }, month: { $month: "$created" }, year: { $year: "$created" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]
  }

  //query for get Payment Summary
  dashboardQuery.paymentQuery = {
    filter: [
      {
        $match: {
          userId: req.tokenInfo._id,
          created: paymentPeriod,
          active: true,
        }
      }, {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" }
        }
      }]
  }
  return dashboardQuery
}


export default {
  generateQuery
}