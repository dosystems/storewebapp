import multer from 'multer';
import XLSX from 'xlsx';
import config from '../config/config';
import Entity from '../models/entity.model';
import ImgModel from '../models/entiImage.model';
import categoryService from './category.service';
import employeeService from '../services/employee.service';
import entityService from '../services/entity.service';
import dateUtil from '../utils/date.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';


const download = require('images-downloader').images;
const Jimp = require("jimp");

/**
 * Storing Uploades file
 * @return {uploded file name}
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, config.upload[req.uploadPath]);
  },
  filename: function (req, file, callback) {
    let ext = '';
    let name = '';
    if (file.originalname) {
      let p = file.originalname.lastIndexOf('.');
      ext = file.originalname.substring(p + 1);
      let firstName = file.originalname.substring(0, p + 1);
      name = Date.now() + '_' + firstName;
      name += ext;
    };
    req.uploadFile.push({ name: name, type: file.mimetype });
    if (req.uploadFile && req.uploadFile.length > 0) {
      callback(null, name);
    };
  }
});

const upload = multer({
  storage: storage
}).array('file');

// convertig csv file data to json type
function getJsonFromCsv(req) {
  let obj = [];
  req.attachment = req.uploadFile[0].name;
  let workbook = XLSX.readFile(config.upload[req.uploadPath] + "/" + req.uploadFile[0].name);
  if (workbook) {
    let sheetName_list = workbook.SheetNames;
    obj = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName_list[0]]);
  };
  return obj;
};

//Insert records into the database
async function insertBulkData(req, res) {
  let responseJson = {};
  let obj;
  if (req.query && req.query.type) {
    if (req.query.type === config.commonRole.employee) {
      obj = await employeeService.insertEmployeesData(req, res);
    } else if (req.query.type === "entity") {
      obj = await entityService.insertEntitiesData(req, res);
    } else {
      req.i18nKey = "failedtoUpload";
      res.json(respUtil.getErrorResponse(req));
      return;
    };
    //if dupicate email exists in the file a new file will get created with duplicates
    if (req.duplicates && req.duplicates.length > 0) {
      await downloadDupicates(req);
      req.i18nKey = "duplicateUpload";
      responseJson.failure = respUtil.getErrorResponse(req);
    };
    obj = obj.filter(function (item) { return item != null })
    if (Object.keys(obj).length == 0) {
      responseJson.failure.message = "All Mails are duplicates";
    } else {
      req.entityType = req.query.type;
      req.activityKey = `${req.query.type}CsvUpload`;
      responseJson.sucess = respUtil.uploadCsvSucessResponse(req)
    };
  };
  return responseJson;
}

/**
 * 
 * @return {Downloaded fie} req 
 */
async function downloadDupicates(req, res) {
  let ws = XLSX.utils.json_to_sheet(req.duplicates);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws);
  req.duplicateFileName = req.entityType + "duplicates" + Date.now() + "_" + ".xlsx"
  let buf = XLSX.writeFile(wb, config.upload[`${req.query.type}Duplicates`] + '/' + req.duplicateFileName);
};

async function generateJsonForEmployee(req) {
  let obj = [];
  let address;
  if (req.obj) {
    for (let val of req.obj) {
      if (val.firstName && val.lastName) {
        address = {}
        if (val.address) {
          address.address = val.address;
          delete val.address
        }
        if (val.street) {
          address.street = val.street;
          delete val.street
        }
        if (val.state) {
          address.state = val.state;
          delete val.state
        }
        if (val.city) {
          address.city = val.city
          delete val.city
        }
        if (val.zip) {
          address.zip = val.zip;
          delete val.zip
        };
        val.address = address;
      };
      obj.push(val);
    };
  }
}

async function downloadImages(imageArr) {
  const dest = config.upload.entity
  return new Promise((resolve, reject) => {
    download(imageArr, dest)
      .then(result => {
        resolve(result)
      })
      .catch((err) => {
        reject(err);
      })
  });
}

// uploading/save images with resize
async function uploadMultipleSizes(req) {
  return new Promise((resolve, reject) => {
    Jimp.read(config.upload[req.uploadPath] + '/' + req.resizeImage).then(function (lenna) {
      lenna.contain(req.size.width, req.size.height)
        .background(0xFFFFFFFF)           // resize
        .quality(100)                 // set quality
        .write(config.upload[req.uploadPath] + '/' + req.size.path + "/" + req.resizeImage); // save
      resolve(true);
    }).catch(function (err) {
      console.log(err);
      return reject(err)
    });
  });
}

// resize uploaded images with size
async function resizeMultipleImages(img, req) {
  req.uploadPath = 'entity';
  req.entityImage = [];
  if (img && img.length > 0) {
    for (let image of img) {
      let size = {};
      let file = image.filename.split('/');
      let isNotCurrupted = await serviceUtil.isImageCurrupted(file[3]);
      if (isNotCurrupted) {
        req.entityImage.push(file[3])
        for (let obj of config.uploadImageSizes) {
          size = JSON.stringify(obj);
          req.size = JSON.parse(size);
          req.resizeImage = file[3];
          try {
            let uploadImages = await uploadMultipleSizes(req);
          } catch (error) {
            console.log("=========> error file =============>")
            console.log(req.resizeImage)
            console.log(error)
            console.log("=========> error file =============>")
          }
        };
      } else {
        console.log(file)
      }
    };
  }
  return req.entityImage;
}
/*
* creating product post body Json
*/
async function generateJsonForEntity(req) {
  let obj = [];
  if (req.obj) {
    for (let val of req.obj) {
      let entity = {};
      if (req.seller) {
        entity.ownerId = req.seller._id;
        entity.ownerName = req.seller.displayName;
      }
      if (val.Categories) {
        let catArray = val.Categories.split(",");
        catArray = catArray.map(val => val.trim());
        entity.multipleCategories = []
        for (let val1 of catArray) {
          entity.multipleCategories.push("Products-" + val1)
        };
        for (let val2 of entity.multipleCategories) {
          req.categories = val2.split('-');
          req.categories = req.categories.map(val => val.trim());
          await categoryService.createCategories(req)
        }
      } else {
        entity.multipleCategories = ["Products"]
      }
      if (val.Description) {
        entity.longDesc = val.Description;
      };
      if (val["Short Description"]) {
        entity.shortDesc = val["Short Description"];
      };
      if (val.ID) {
        entity.entityId = val.ID;
      };
      if (val.Images) {
        entity.images = {Color:"Default",images:[]}
        let images = val.Images.split(",");
        entity.entityImages = images.map(val => val.trim());
        if (images.length > 0) {
          for(let img of images){
            let imgName = img.split("/");
            entity.images.images.push(imgName[imgName.length-1])
          }
        }
      };
      if (val.Name) {
        entity.name = val.Name;
      };
      if (val["Visibility in catalog"] === "visible") {
        entity.visibleDate = dateUtil.getTodayDate() + config.dayRanges.start;
        entity.expiryDate = dateUtil.getFutureDate(365) + config.dayRanges.start;
      };

      entity.inventories = [];
      let inventory = {};
      if (val["Stock"]) {
        inventory.Quantity = parseFloat(val["Stock"]);
      } else {
        inventory.Quantity = 0;
      }
      if (val["Attribute 1 name"] === "UWCF Colors" && val["Attribute 1 value(s)"]) {
        inventory.Color = val["Attribute 1 value(s)"];
      }
      if (val["Attribute 2 name"] === "UWCF Sizes" && val["Attribute 2 value(s)"]) {
        inventory.Size = val["Attribute 2 value(s)"];
      }
      if (val["Regular price"]) {
        inventory.MRP = parseFloat(val["Regular price"]);
      } else {
        inventory.MRP = 0;
      }
      if (val["Sale price"]) {
        inventory.Price = parseFloat(val["Sale price"]);
      } else {
        inventory.Price = inventory.MRP;
      }
      if (val["Height (in)"]) {
        inventory.Height = parseFloat(val["Height (in)"]);
      };
      if (val["Length (in)"]) {
        inventory.Length = parseFloat(val["Length (in)"]);
      };
      if (val["Weight (lbs)"]) {
        inventory.Weight = parseFloat(val["Weight (lbs)"]);
      };
      if (val["Width (in)"]) {
        inventory.Width = parseFloat(val["Width (in)"]);
      };
      entity.inventories.push(inventory);
      obj.push(entity);
    }
  }
  return obj;
}
export default {
  upload,
  getJsonFromCsv,
  insertBulkData,
  downloadDupicates,
  generateJsonForEmployee,
  uploadMultipleSizes,
  generateJsonForEntity,
  resizeMultipleImages,
  downloadImages
}