import dateUtil from "./date.util";
import config from '../config/config';

/**
 * generateQuery 
 * @param req 
 */
function generateQuery(req) {
  let reportQuery = {};

  reportQuery.productCartQuery = [
    {
      $match: { active: true, status: "AddedToCart" }
    },
    {
      $group:
      {
        _id: { entityId: "$entityId", name: "$entityName" },
        quantity: { $sum: "$quantity" }
      }
    }
  ]

}