import PDFDocument from 'pdfkit';
import fs from 'fs';
import Cryptr from 'cryptr';
import config from '../config/config';
import dateUtil from '../utils/date.util';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';

// cryptr key
const cryptr = new Cryptr("BUXKEY");

/**
 * createPdfFile
 * @param req
 * @param res
 */

function createPdfFile(req, res) {
  if (req && req.templateInfo && req.templateInfo.orderDetails && req.templateInfo.orderDetails.length > 0) {
    req.filePath = config.upload.pdf + req.templateInfo.orderDetails[0].invoiceNo + '.pdf';

    req.doc = new PDFDocument;
    req.doc.pipe(fs.createWriteStream(req.filePath));
    setPdfData(req, res);
    req.doc.end();
  }
  req.fileName = req.templateInfo.orderDetails[0].invoiceNo +'.pdf';
  return req.fileName;
}



function setPdfData(req, res) {
  if (req && req.templateInfo && req.templateInfo.orderDetails && req.templateInfo.orderDetails.length > 0) {
    let index = 0;
    for (let order of req.templateInfo.orderDetails) {
      if (index > 0) {
        req.doc.addPage();
      }
      req.doc.fillColor('#070708');
      req.doc.fontSize(9)
      req.doc.font(config.upload.fonts + 'Calibri Bold.ttf')
      req.doc.text('SELLER', 235, 60);
      req.doc.text('BUYER', 400, 60);
      req.doc.text('ORDER INVOICE', 60, 60);
      req.doc.font(config.upload.fonts + 'Calibri.ttf')
      req.doc.moveDown()
      req.doc.text('Order Id', 60, 80);
      req.doc.text("Invoice No", 60, 90);
      req.doc.text('Invoice Date', 60, 100);
      // req.doc.text("Shipment Nr", 60, 110);

      req.doc.text(order.orderId, 115, 80);
      req.doc.text(order.invoiceNo, 115, 90);
      let purchased = order.purchased.toISOString().split("T")
      console.log(purchased)
      req.doc.text(purchased[0], 115, 100);
      // req.doc.text("5454545454", 115, 110);


      req.doc.moveDown()
      req.doc.text(order.ownerName, 235, 80);
      req.doc.text(order.shippingFrom.street, 235, 90);
      req.doc.text(order.shippingFrom.state, 235, 100);
      req.doc.text(order.shippingFrom.city, 235, 110);
      req.doc.text(order.shippingFrom.country, 235, 120);
      req.doc.text(order.shippingFrom.zip, 235, 130);


      req.doc.moveDown()
      req.doc.text(order.shipmentAddress.name, 400, 80);
      req.doc.text(order.shipmentAddress.street, 400, 90);
      req.doc.text(order.shipmentAddress.state, 400, 100);
      req.doc.text(order.shipmentAddress.city, 400, 110);
      req.doc.text(order.shipmentAddress.country, 400, 120);
      req.doc.text(order.shipmentAddress.zip, 400, 130);

      req.doc.moveDown();
      req.doc.fontSize(12);
      req.doc.rect(50, 150, 500, 30)
      req.doc.fontSize(9)
      req.doc.fill("#c9c5b2")
      req.doc.stroke();
      req.doc.fill("black")
      req.doc.moveDown()
      req.doc.font(config.upload.fonts + 'Calibri Bold.ttf')
      req.doc.text('Serial', 60, 155, 80);
      req.doc.text('No', 60, 165, 80);
      req.doc.text('product', 90, 155, 100);
      req.doc.text('Code', 90, 165, 100);
      req.doc.text('Description', 175, 160, 200);
      req.doc.text('Quantity', 420, 160, 220);
      req.doc.text('Price', 460, 160);

      req.doc.moveDown()
      req.doc.font(config.upload.fonts + 'Calibri.ttf')
      req.doc.text('1', 60, 188, 80);
      req.doc.text(order.entityCode, 90, 188, 100);
      let content = order.entityName;
      let length = 50;
      let result = '';
      while (content.length > 0) {
        result += content.substring(0, length) + '\n';
        content = content.substring(length);
        
      }
      req.doc.text(result, 175, 188)
      req.doc.text(order.quantity, 430, 188);
      req.doc.text(order.currencies[1].BUX.toFixed(2), 460, 188);

      req.doc.rect(50, 220, 500, 1)
      req.doc.fill("#c9c5b2")
      req.doc.fill("black")
      req.doc.font(config.upload.fonts + 'Calibri Bold.ttf')
      req.doc.text('BUX', 465, 235, 220);
      req.doc.font(config.upload.fonts + 'Calibri.ttf')
      req.doc.text('Price', 420, 250, 220);
      req.doc.text(': ' + order.currencies[1].BUX.toFixed(2), 460, 250, 220);
      req.doc.text('Quantity', 420, 265, 220);
      req.doc.text(': ' + order.quantity, 460, 265, 220);
      req.doc.text('Total', 420, 280, 220);
      req.doc.text(': '+order.BUX.toFixed(2), 460, 280, 220);
      index++;
    }
  }
}


export default {
  createPdfFile,
  setPdfData
};
