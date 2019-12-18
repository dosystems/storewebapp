import { ShipEngine } from 'shipengine';
import respUtil from '../utils/resp.util';
import config from '../config/config';
import reqService from './request.service';
import dateUtil from '../utils/date.util';
const Easypost = require('@easypost/api');
const Postmen = require('postmen');
var shippo = require('shippo')("shippo_test_fc5e8f49e8dc9d283bb739adfd14039764a487e0");

const engine = new ShipEngine('zuSH+/24Hk9a6Qx92p3XwrSr2QOt8DdLZW+9HKep7bg');

async function validateShippingAddress(address) {
  return new Promise((resolve, reject) => {
    engine.validateAddress(address).then((data) => {
      if (data) {
        resolve(data);
      }
    }).catch((err) => {
      console.log('error', err);
      return reject(err);
    });
  })
}
async function shipmentRates(req, res) {
  let response = []
  if (req.body.shipFrom && req.body.shipFrom.country_code && req.body.shipFrom.country_code === "GB") {
    let ship_to = req.body.shipTo;
    let ship_from = req.body.shipFrom;
    // let isFromValid = await validateShippingAddress(ship_from);
    // let isToValid = await validateShippingAddress(ship_to);
    // if (isFromValid && isFromValid[0] && isFromValid[0].status && isFromValid[0].status !== "verified") {
    //   req.i18nKey = "fromAddNotValid"
    //   return respUtil.getErrorResponse(req);
    // }
    // if (isToValid && isToValid[0] && isToValid[0].status && isToValid[0].status !== "verified") {
    //   req.i18nKey = "toAddNotValid"
    //   return respUtil.getErrorResponse(req);
    // }
    var shipment = {
      customs: config.shipmentFileds.customs,
    };
    if (ship_from) {
      shipment.ship_from = ship_from;
    }
    if (ship_to) {
      shipment.ship_to = ship_to;
    }
    if (req.body.parcel) {
      shipment.packages = req.body.parcel
    }
    // var shipment = {
    //   "customs": {
    //     "contents": "documents",
    //     "customs_items": [{
    //       "description": "letter",
    //       "quantity": 1,
    //       "value": 1,
    //       "harmonized_tariff_code": "4817.20",
    //       "country_of_origin": "UK"
    //     }],
    //     "non_delivery": "treat_as_abandoned"
    //   },
    //   "ship_from": {
    //     "address_line1": "Dashwood House,",
    //     "city_locality": "London",
    //     "state_province": "UK",
    //     "postal_code": "EC2M 1QS",
    //     "country_code": "GB",
    //     "name": "ilyas",
    //     "phone": "998989898998"
    //   },
    //   "ship_to": {
    //     "address_line1": "james street",
    //     "city_locality": "Greenhill",
    //     "state_province": "Wembley",
    //     "postal_code": "HA9 9HF",
    //     "country_code": "GB",
    //     "name": "mosin",
    //     "phone": "5998654561"
    //   },
    //   "packages": [{
    //     "weight": {
    //       "value": 1,
    //       "unit": "ounce"
    //     },
    //     "dimensions": {
    //       "unit": "inch",
    //       "length": 12,
    //       "width": 7.1,
    //       "height": 6
    //     }
    //   }]
    // }
    return new Promise((resolve, reject) => {
      engine.getCarriers().then((data) => {
        return data.carriers.map((val) => {
          return val.carrier_id
        });
      })
        .then((data) => {
          //console.log(data)
          return engine.getRates(shipment, {
            carrier_ids: data
          });
        })
        .then((data) => {
          //console.log(data)
          if (data && data.rate_response && data.rate_response.rates && data.rate_response.rates.length > 0) {
            let obj;
            for (let rate of data.rate_response.rates) {
              obj = {};
              obj.shippingAmount = rate.shipping_amount.amount;
              obj.packageType = rate.package_type;
              obj.expectedDeliviryDays = rate.delivery_days;
              obj.estimatedDeliveryOn = rate.estimated_delivery_date;
              obj.serviceType = rate.service_type;
              obj.carrierName = rate.carrier_friendly_name;
              if (obj.expectedDeliviryDays && obj.estimatedDeliveryOn && obj.shippingAmount) {
                response.push(obj);
              }
            }
            // console.log(response)
            resolve(response)
          }
          else if (ship_to.country_code && ship_to.country_code === "GB") {
            let obj = {};
            obj.shippingAmount = 10;
            obj.expectedDeliviryDays = 1;
            obj.estimatedDeliveryOn = new Date(dateUtil.getFutureDate(1));
            obj.serviceType = "standard";
            obj.carrierName = "FedEx UK";
            response.push(obj);
            //console.log(response)
            resolve(response)
          }
          else {
            // console.log(4444)
            req.i18nKey = "ratesNotFound";
            req.err = true;
            resolve(respUtil.getErrorResponse(req))
          }

        })
        .catch((err) => {
          return reject(err);
        });
    })

  } else {
    //Postmen API 

    let shipTo = {};
    let shipFrom = {};
    parcels = [];
    if (req.body.shipFrom && req.body.shipTo && req.body.parcel) {
      shipFrom = {
        "contact_name": req.body.shipFrom.name,
        "street1": req.body.shipFrom.address_line1,
        "city": req.body.shipFrom.city_locality,
        "state": req.body.shipFrom.state_province,
        "postal_code": req.body.shipFrom.postal_code,
        "country": req.body.shipFrom.country_code,
        "phone": req.body.shipFrom.phone,
      }
      shipTo = {
        "contact_name": req.body.shipTo.name,
        "street1": req.body.shipTo.address_line1,
        "city": req.body.shipTo.city_locality,
        "state": req.body.shipTo.state_province,
        "postal_code": req.body.shipTo.postal_code,
        "country": req.body.shipTo.country_code,
        "phone": req.body.shipTo.phone,
      }
      if (req.body.parcel.length > 0) {
        for (let parcel of req.body.parcel) {
          if (parcel && parcel.dimensions && parcel.weight) {
            let weight = {};
            weight.value = parcel.weight.value;
            if (parcel.weight.unit && parcel.weight.unit === "ounce") {
              weight.unit = "oz";
            } else if (parcel.weight.unit && parcel.weight.unit === "pound") {
              weight.unit = "lb";
            } else if (parcel.weight.unit && parcel.weight.unit === "gram") {
              if (weight.value < 1000) {
                weight.unit = "g";
              } else {
                weight.unit = "kg"
                weight.value = weight.value / 1000;
              }
            }
            let dimension = {};
            dimension.height = parcel.dimensions.height;
            dimension.width = parcel.dimensions.width;
            dimension.depth = parcel.dimensions.length;
            if (parcel.dimensions.unit && parcel.dimensions.unit === "inch") {
              dimension.unit = 'in'
            } else if (parcel.dimensions.unit && parcel.dimensions.unit === "centimeter") {
              dimension.unit = 'cm'
            }

            parcels.push({
              "box_type": "custom",
              "dimension": dimension,
              "items": [
                {
                  "description": "Food Bar",
                  "quantity": 1,
                  "price": {
                    "amount": 20,
                    "currency": "INR"
                  },
                  "weight": weight
                }
              ]
            })
          }
        }
      }
    }

    var shipId = [];
    var option = {
      method: 'GET',
      url: 'https://sandbox-api.postmen.com/v3/shipper-accounts',
      headers: {
        'content-type': 'application/json',
        'postmen-api-key': 'fff5307d-44c8-4873-904a-7022917e2bba'
      },
      // body: '{"slug":"fedex","description":"My Shipper Account","timezone":"Asia/Hong_Kong","credentials":{"account_number":"510087240","key":"l7tLJUHp0HqnVuHw","password":"!Punjab123","meter_number":"119084741"},"address":{"country":"USA","contact_name":"Sir Foo","phone":"2125551234","fax":"+1 206-654-3100","email":"foo@foo.com","company_name":"Foo Store","street1":"255 New town","street2":"Wow Avenue","city":"Beverly Hills","type":"business","postal_code":"90210","state":"CA","street3":"Boring part of town","tax_id":"911-70-1234"}}'
    };
    let resp = await reqService.sendRequest(option);
    // for(let shipper_account of JSON.parse(resp).data.shipper_accounts){
    //   shipId.push({ id: shipper_account.id });

    // }
    shipId.push({ id: JSON.parse(resp).data.shipper_accounts[0].id });
    console.log(shipId)
    var options = {
      method: 'POST',
      url: 'https://sandbox-api.postmen.com/v3/rates',
      headers: {
        'content-type': 'application/json',
        'postmen-api-key': 'fff5307d-44c8-4873-904a-7022917e2bba'
      },

      body: {
        "async": false,
        "shipper_accounts": shipId,
        "shipment": {
          "parcels": parcels,
          "ship_from": shipFrom,
          "ship_to": shipTo
        }
      },
      json: true
    };
    async function getRates(options, response) {
      let count = 0;
      resp = await reqService.sendRequest(options);
      if (resp && resp.body && resp.body.data && resp.body.data.rates && resp.body.data.rates.length > 0) {
        let obj;
        for (let rate of resp.body.data.rates) {
          console.log(rate)
          if (rate.error_message === null && rate.info_message === null) {
            obj = {};
            obj.shippingAmount = rate.total_charge.amount;
            obj.currency = rate.total_charge.currency;
            // obj.packageType = rate.service_type;
            obj.expectedDeliviryDays = dateUtil.getDifference(new Date(rate.delivery_date), new Date());
            obj.estimatedDeliveryOn = rate.delivery_date;
            obj.serviceType = rate.service_type;
            obj.carrierName = rate.service_name;
            response.push(obj);
          } else {
            count++;
          }
        }
        if (count > 0) {
          return await getRates(options, response)
        } else {
          return response;
        }

      }
    }
    response = await getRates(options, response)
    if (response) {
      return response;
    }
  }



}


// shipmentRates()
export default {
  shipmentRates
}

// getRates()
async function getRates() {

  const api = new Easypost('EZTK83ad2bb778bf4a9ab3c618ccb456c9c3PUyARFNXyuQ73RMYfOA9vQ');

  /* Either objects or ids can be passed in. If the object does
   * not have an id, it will be created. */

  // const toAddress = {
  //   name: "Manohar",
  //   street1: "RP road",
  //   city: "Hyderabad",
  //   state: "TS",
  //   zip: "500017",
  //   country: "IN",
  //   phone: "8573875756",
  //   email: "dr_steve_brule@gmail.com"
  // };
  const toAddress = {
    "company": "EASYPOST",
    "name": "janjn",
    "street1": "417 MONTGOMERY ST FL 5",
    "street2": "",
    "city": "SAN FRANCISCO",
    "state": "CA",
    "zip": "94104",
    "country": "US",
    "phone": "4155555555",
  }
  const fromAddress = {
    name: "janjn",
    street1: "Nizampet X road",
    city: "Hyderabad",
    state: "TS",
    zip: "500072",
    country: "IN",
    phone: "8573875756",
    email: "dr_steve_brule@gmail.com"
  };
  const parcel = {
    length: '20.2',
    width: '10.9', height: '5', weight: '65.9'
  };
  // const customsInfo = new api.CustomsInfo({
  //   'description': 'Sweet shirts',
  //   'quantity': 2,
  //   'weight': 11,
  //   'value': 23,
  //   'hs_tariff_number': '654321',
  //   'origin_country': 'US'
  // });
  var options = {
    url: 'https://api.easypost.com/v2/shipments',
    method: 'POST',
    body: {
      "shipment": {
        "parcel": parcel,
        "from_address": fromAddress,
        "to_address": toAddress
      }
    },
    auth: {
      'user': 'EZTK83ad2bb778bf4a9ab3c618ccb456c9c3PUyARFNXyuQ73RMYfOA9vQ',
      'pass': ''
    },
    json: true
  };
  let resp = await reqService.sendRequest(options);
  console.log(resp.body)


}
