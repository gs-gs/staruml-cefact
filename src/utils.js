var forEach = require('async-foreach').forEach;

const notAvailElement = require('./notavailelement');
const openAPI = require('./openapi');
const fs = require('fs');
const constant = require('./constant');

/**
 * @description class is general utility class for the whole project
 * @class Utils
 */

let errorContent = [];
let mFileName = '/error.txt';
/**
 * @constructor Creates an instance of Utils.
 */
function resetErrorBlock() {
     errorContent = [];
     mFileName = '/error.txt';
}

/**
 * @function writeErrorToFile
 * @description Catch the error and write it to file
 * @param {Object} error
 * @memberof Utils
 */
function writeErrorToFile(error) {
     errorContent.push(error.message);
     fs.writeFile(openAPI.getFilePath() + mFileName, JSON.stringify(errorContent), function (err) {
          if (err) {
               console.error("Error writing file", err);
          }
     });
}

/**
 * @function buildDescription
 * @description Description replace (') with ('')
 * @param {string} desc
 * @memberof Utils
 */
function buildDescription(desc) {
     if (desc)
          return desc.replace(/\'/g, "''")

     return null;
}

/**
 * @function buildParameter
 * @description Adds parameters to the file
 * @param {string} name
 * @param {string} type
 * @param {string} description
 * @param {boolean} required
 * @param {string} schema 
 * @memberof Utils
 */
function buildParameter(name, type, description, required, schema, paramsObject) {


     paramsObject.name = name;
     paramsObject.in = type;
     paramsObject.description = description;
     paramsObject.required = required;
     paramsObject.schema = schema;

}


/**
 * @function addAttributeType
 * @description add attribute type based on openapi spefication datatype
 * @param {Object} itemsObj 
 * @memberof Utils
 */
function addAttributeType(itemsObj, attr) {
     let starUMLType = attr.type;
     if (starUMLType === 'Numeric') {
          itemsObj.type = 'number';
     } else if (starUMLType === 'Indicator') {
          itemsObj.type = 'boolean';
     } else if (starUMLType === 'Date') {
          itemsObj.type = 'string';
          itemsObj.format = 'date';
     } else if (starUMLType === 'DateTime') {
          itemsObj.type = 'string';
          itemsObj.format = 'date-time';
     } else if (starUMLType === 'Integer') {
          itemsObj.type = 'integer';
     } else if (starUMLType === 'Int32') {
          itemsObj.type = 'integer';
          itemsObj.format = 'int32';
     } else if (starUMLType === 'Int64') {
          itemsObj.type = 'integer';
          itemsObj.format = 'int64';
     } else if (starUMLType === 'Number') {
          itemsObj.type = 'number';
     } else if (starUMLType === 'Float') {
          itemsObj.type = 'number';
          itemsObj.format = 'float';
     } else if (starUMLType === 'Double') {
          itemsObj.type = 'number';
          itemsObj.format = 'double';
     } else if (starUMLType === 'Password') {
          itemsObj.type = 'string';
          itemsObj.format = "password";
     } else if (starUMLType === 'Byte') {
          itemsObj.type = 'string';
          itemsObj.format = 'byte';
     } else if (starUMLType === 'Boolean') {
          itemsObj.type = 'boolean';
     } else if (starUMLType === 'Binary') {
          itemsObj.type = 'string';
          itemsObj.format = 'binary';
     } else {
          itemsObj.type = 'string';

          if (isString(starUMLType)) {
               notAvailElement.checkAndaddNotAvailableClassOrEnumeInFile(attr._parent.name, attr, starUMLType);
          }
     }
}

/**
 * @function buildRequestBody
 * @description Adds request body to requestBodyObj
 * @param {UMLInterfaceRealization} objInterface
 * @param {Object} requestBodyObj
 * @memberof Utils
 */
function buildRequestBody(objInterface, requestBodyObj) {

     let contentObj = {};
     requestBodyObj.content = contentObj;

     let appJsonObject = {};
     contentObj['application/json'] = appJsonObject;

     let schemaObj = {};
     appJsonObject.schema = schemaObj;

     schemaObj['$ref'] = constant.getReference() + objInterface.source.name;


     requestBodyObj.description = '';
     requestBodyObj.required = true;

}

/**
 * @function writeQueryParameters
 * @description adds query paramerter in object
 * @param {Array} parametersArray
 * @param {Object} objOperation
 * @memberof Utils
 */
function writeQueryParameters(parametersArray, objOperation) {
     try {
          objOperation.parameters.forEach(itemParameters => {
               let paramsObject = {};
               if (itemParameters.name != "id" && itemParameters.name != "identifier") {
                    parametersArray.push(paramsObject);
                    let objSchema = {};
                    objSchema.type = 'string';
                    if (!(itemParameters.type instanceof type.UMLClass)) {
                         buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
                              buildDescription(itemParameters.documentation) :
                              "missing description"), false, objSchema, paramsObject);
                    } else {

                         buildParameter(itemParameters.type.name + "." + itemParameters.name, "query", (itemParameters.documentation ?
                              buildDescription(itemParameters.documentation) :
                              "missing description"), false, objSchema, paramsObject);

                    }
               }
          });
     } catch (error) {
          console.error("Found error", error.message);
          writeErrorToFile(error);
     }
}


/**
 * @function getEnumerationLiteral
 * @description return Enumeratoin literals
 * @param {UMLEnumaration} objEnum 
 * @returns {Array}
 * @memberof Utils
 */
function getEnumerationLiteral(objEnum) {
     if (objEnum) {
          let result = [];
          objEnum.literals.forEach(literal => {
               /* Filter for visible literal Views from diagram elements (Enumeration) */
               if (addLiteralData(literal)) {
                    result.push(literal.name);
               }
          });
          return (result);
     }
}

/**
 * @function isEmpty
 * @description check UMLPackage has UMLClass, UMLInterface, UMLEnumeration and return boolean
 * @param {*} umlPackage
 * @returns {boolean}
 */
function isEmpty(umlPackage) {
     let ownedElements = [];
     umlPackage.ownedElements.filter(function (item) {
          if (item instanceof type.UMLClass ||
               item instanceof type.UMLInterface ||
               item instanceof type.UMLEnumeration) {

               ownedElements.push(item);
          }
     });
     if (ownedElements.length > 0) {
          return false;
     }
     return true;
}
/**
 * @function isAttribviewVisible
 * @description find view of attribute and return that view is visible or not
 * @param {*} attribute
 * @returns {boolean}
 */
function isAttribviewVisible(attribute) {
     let isVisible = false;
     let ArrUMLAttributeView = app.repository.getViewsOf(attribute);
     if (ArrUMLAttributeView.length >= 1) {

          let resAttr = ArrUMLAttributeView.filter(function (item) {
               return item.model._id == attribute._id;
          });
          console.log("----view-checking----attr-views", resAttr);
          if (resAttr.length > 0) {

               let UMLAttributeView = resAttr[0];
               if (UMLAttributeView.visible) {
                    isVisible = true;
               }
          }
     }
     return isVisible;
}
/**
 * @function addAttributeData
 * @description check that element attribute is visible and return boolean that attribute should allow to add attribute
 * @param {*} element
 * @returns {boolean}
 */
function addAttributeData(element) {
     let mAddAttributeData = false;
     if (openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM && isAttribviewVisible(element)) {

          mAddAttributeData = true;

     } else if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {

          mAddAttributeData = true;

     }
     return mAddAttributeData;
}
/**
 * @function addOperationData
 * @description check that element operation is visible and return boolean that operation should allow to add operation
 * @param {*} element
 * @returns {boolean}
 */
function addOperationData(element) {
     let mAddOperationData = false;
     if (openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM && isAttribviewVisible(element)) {

          mAddOperationData = true;

     } else if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {

          mAddOperationData = true;

     }
     return mAddOperationData;
}
/**
 * @function addLiteralData
 * @description check that element literal is visible and return boolean that literal should allow to add literal
 * @param {*} element
 * @returns {boolean}
 */
function addLiteralData(element) {
     let mAddLiteralData = false;
     if (openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM && isAttribviewVisible(element)) {

          mAddLiteralData = true;

     } else if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {

          mAddLiteralData = true;

     }
     return mAddLiteralData;
}

/**
 * @function isString
 * @description returns boolean that checks values is string or any object
 * @returns {boolean}
 */
function isString(s) {
     return typeof (s) === 'string' || s instanceof String;
}
module.exports.isString = isString;
module.exports.isEmpty = isEmpty;
module.exports.isAttribviewVisible = isAttribviewVisible;
module.exports.addOperationData = addOperationData;
module.exports.addAttributeData = addAttributeData;
module.exports.addLiteralData = addLiteralData;
module.exports.resetErrorBlock = resetErrorBlock;
module.exports.writeErrorToFile = writeErrorToFile;
module.exports.buildDescription = buildDescription;
module.exports.buildParameter = buildParameter;
module.exports.addAttributeType = addAttributeType;
module.exports.buildRequestBody = buildRequestBody;
module.exports.writeQueryParameters = writeQueryParameters;
module.exports.getEnumerationLiteral = getEnumerationLiteral;