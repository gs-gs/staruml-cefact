var forEach = require('async-foreach').forEach;
const notAvailElement = require('./notavailelement');
const openAPI = require('./openapi');
const fs = require('fs');
const constant = require('./constant');
const dElement = require('../src/diagram/dElement');

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

     if(paramsObject==null){
          return;
     }

     paramsObject.name = name;
     paramsObject.in = type;
     paramsObject.description = description;
     paramsObject.required = required;
     paramsObject.schema = schema;

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
          let literals = [];
          if (openAPI.isModelPackage()) {
               forEach(objEnum.literals, function (literal) {
                    result.push(literal.name);
               });
          } else if (openAPI.isModelDiagram()) {
               let enumView = getViewFromCurrentDiagram(objEnum);
               if (enumView) {

                    let literalViews = getVisibleLiteralsView(enumView);
                    forEach(literalViews, function (literalView) {
                         literals.push(literalView.model);
                    });
                    forEach(literals, function (literal) {
                         /* Filter for visible literal Views from diagram elements (Enumeration) */
                         result.push(literal.name);
                    });
               }

          }
          return result;
     }
}

/**
 * @function isEmpty
 * @description check UMLPackage has UMLClass, UMLInterface, UMLEnumeration and return boolean
 * @param {*} umlPackage
 * @returns {boolean}
 */
function isEmpty(exportElement) {
     let ownedElements = [];
     if (exportElement instanceof type.UMLClassDiagram) {
          exportElement.ownedViews.filter(function (item) {
               if (item instanceof type.UMLClassView ||
                    item instanceof type.UMLInterfaceView ||
                    item instanceof type.UMLEnumerationView) {
                    ownedElements.push(item);
               }
          });
     } else if (exportElement instanceof type.UMLPackage) {
          exportElement.ownedElements.filter(function (item) {
               if (item instanceof type.UMLClass ||
                    item instanceof type.UMLInterface ||
                    item instanceof type.UMLEnumeration) {
                    ownedElements.push(item);
               }
          });
     }

     if (ownedElements.length > 0) {
          return false;
     }
     return true;
}

/**
 * @function isString
 * @description returns boolean that checks values is string or any object
 * @returns {boolean}
 */
function isString(s) {
     return typeof (s) === 'string' || s instanceof String;
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
     }else if (starUMLType === 'Text') {
          itemsObj.type = 'string';
     }else if (starUMLType === 'Indicator') {
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
     } else if (starUMLType === 'Quantity') {
          itemsObj.type = 'integer';
     } else if (isCoreDataType(starUMLType)) {

          /* Added reference in allOf object when attribute type is among the Core Data Type */

          let attrType = getCoreDataType(starUMLType);

          let allOfArray = [];
          itemsObj.allOf = allOfArray;

          /* Adding description */
          let allOfObject = {};
          allOfObject['description'] = itemsObj.description;
          allOfArray.push(allOfObject);

          /* Delete description from parent object */
          delete itemsObj['description']

          /* Adding reference */
          allOfObject = {};
          allOfObject['$ref'] = constant.getReference() + attrType;
          allOfArray.push(allOfObject);

          /* Adding object field */
          allOfObject = {};
          allOfObject.type = 'object';
          allOfArray.push(allOfObject);

     }
     /* else if (starUMLType instanceof type.UMLClass && starUMLType.name === 'Measure') {
               itemsObj['$ref'] = constant.getReference() + starUMLType.name;
          } else if(isString(starUMLType) && starUMLType === 'Measure'){
               itemsObj['$ref'] = constant.getReference() + starUMLType;
          } */
     else {
          itemsObj.type = 'string';

          if (isString(starUMLType)) {
               notAvailElement.checkAndaddNotAvailableClassOrEnumeInFile(attr._parent.name, attr, starUMLType);
          }
     }
}

function isCoreDataType(attrType) {
     let mType = '';
     if (isString(attrType)) {
          mType = attrType;
     } else if (attrType instanceof type.UMLClass) {
          mType = attrType.name;
     }
     if (mType === 'Measure' || mType === 'Text' || mType === 'Binary' || mType === 'Amount' ||
          mType === 'Numeric' || mType === 'Identifier' || mType === 'Code' || mType === 'Indicator' || mType === 'DateTime') {
          return true;
     }
     return false;
}

function getCoreDataType(attrType) {
     let mType = '';
     if (isString(attrType)) {
          mType = attrType;
     } else if (attrType instanceof type.UMLClass) {
          mType = attrType.name;
     }
     return mType
}

function getVisibleAttributeView(elementView) {
     let mAttriabuteView = elementView.attributeCompartment.subViews.filter(function (attrView) {
          return attrView.visible
     });
     return mAttriabuteView;
}

function getVisibleLiteralsView(elementView) {
     let mAttriabuteView = elementView.enumerationLiteralCompartment.subViews.filter(function (attrView) {
          return attrView.visible
     });
     return mAttriabuteView;
}

function getVisibleOperationView(elementView) {
     let operationView = elementView.operationCompartment.subViews.filter(function (operationView) {
          return operationView.visible
     });
     return operationView;
}

function getCoreDataTypeAttributeClass(classes) {
     let arrCoreDataTypeAttr = [];

     if (openAPI.isModelDiagram()) {

          let mClassesView = dElement.getUMLClassView();

          forEach(mClassesView, function (mClassView) {
               let mAttriabuteView = mClassView.attributeCompartment.subViews.filter(function (attrView) {
                    return attrView.visible
               });
               /* Iterate to all attributes for check and add for qualified data type all Core Data Type */
               forEach(mAttriabuteView, function (attribView) {
                    let attrib = attribView.model;
                    if (isCoreDataType(attrib.type)) {
                         let attribType = getCoreDataType(attrib.type);

                         if (isString(attrib.type) && attrib.type === attribType && notAvailElement.isAvailabl(attribType)) {
                              /* Check and add if attrib type in string and that qualified datatype is available in model */
                              let srchRes = app.repository.search(attribType);
                              let srchResult = srchRes.filter(function (element) {
                                   if (element instanceof type.UMLClass || element instanceof type.UMLEnumeration) {
                                        return element.name == attribType;
                                   }
                              });
                              if (srchResult.length == 1) {
                                   let result = arrCoreDataTypeAttr.filter(function (item) {
                                        return item._id == srchResult[0]._id;
                                   });
                                   if (result.length == 0) {
                                        arrCoreDataTypeAttr.push(srchResult[0]);
                                   }
                              }
                         } else if (isString(attrib.type) && attrib.type === attribType && !notAvailElement.isAvailabl(attribType)) {
                              let str = attrib._parent.name + '/' + attrib.name + ': ' + attrib.type
                              notAvailElement.addNotAvailableClassOrEnumeInFile(str);
                         } else if (attrib.type instanceof type.UMLClass && attrib.type.name == attribType) {
                              /* Check and add if attrib type is reference of UMLClass and available in model */
                              let result = arrCoreDataTypeAttr.filter(function (item) {
                                   return item._id == attrib.type._id;
                              });
                              if (result.length == 0) {
                                   arrCoreDataTypeAttr.push(attrib.type);
                              }
                         }
                    }
               });
          });
     } else {
          forEach(classes, function (mClass) {
               /* Iterate to all attributes for check and add for qualified data type all Core Data Type */
               forEach(mClass.attributes, function (attrib) {

                    // console.log("1111----type", attrib.type);
                    if (isCoreDataType(attrib.type)) {
                         let attribType = getCoreDataType(attrib.type);
                         // console.log("1111----2222----type", type);

                         if (isString(attrib.type) && attrib.type === attribType && notAvailElement.isAvailabl(attribType)) {
                              /* Check and add if attrib type in string and that qualified datatype is available in model */
                              let srchRes = app.repository.search(attribType);
                              let srchResult = srchRes.filter(function (element) {
                                   if (element instanceof type.UMLClass || element instanceof type.UMLEnumeration) {
                                        return element.name == attribType;
                                   }
                              });
                              if (srchResult.length == 1) {
                                   let result = arrCoreDataTypeAttr.filter(function (item) {
                                        return item._id == srchResult[0]._id;
                                   });
                                   if (result.length == 0) {
                                        arrCoreDataTypeAttr.push(srchResult[0]);
                                   }
                              }
                         } else if (isString(attrib.type) && attrib.type === attribType && !notAvailElement.isAvailabl(attribType)) {
                              let str = attrib._parent.name + '/' + attrib.name + ': ' + attrib.type
                              notAvailElement.addNotAvailableClassOrEnumeInFile(str);
                         } else if (attrib.type instanceof type.UMLClass && attrib.type.name == attribType) {
                              /* Check and add if attrib type is reference of UMLClass and available in model */
                              let result = arrCoreDataTypeAttr.filter(function (item) {
                                   return item._id == attrib.type._id;
                              });
                              if (result.length == 0) {
                                   arrCoreDataTypeAttr.push(attrib.type);
                              }
                         }
                    }
               });
          });
     }
     return arrCoreDataTypeAttr;
}

function getViewFromCurrentDiagram(element) {
     let mInterfaceViews = app.repository.getViewsOf(element).filter(e =>
          e.constructor === element.getViewType() &&
          e._parent instanceof type.UMLClassDiagram &&
          e._parent.name === openAPI.getExportElement().name
     );
     if (mInterfaceViews.length == 1) {
          return mInterfaceViews[0];
     }
     return null;
}

function getViewFromOther(element) {
     let elementViews = app.repository.getViewsOf(element).filter(e =>
          e.constructor === element.getViewType()
     );
     if (elementViews.length > 0) {
          return elementViews[0];
     }
     return null;
}
module.exports.getViewFromOther = getViewFromOther;
module.exports.isCoreDataType = isCoreDataType;
module.exports.getCoreDataType = getCoreDataType;
module.exports.isString = isString;
module.exports.isEmpty = isEmpty;
module.exports.resetErrorBlock = resetErrorBlock;
module.exports.writeErrorToFile = writeErrorToFile;
module.exports.buildDescription = buildDescription;
module.exports.buildParameter = buildParameter;
module.exports.addAttributeType = addAttributeType;
module.exports.buildRequestBody = buildRequestBody;
module.exports.writeQueryParameters = writeQueryParameters;
module.exports.getEnumerationLiteral = getEnumerationLiteral;
module.exports.getCoreDataTypeAttributeClass = getCoreDataTypeAttributeClass;
module.exports.getVisibleAttributeView = getVisibleAttributeView;
module.exports.getVisibleOperationView = getVisibleOperationView;
module.exports.getVisibleLiteralsView = getVisibleLiteralsView;
module.exports.getViewFromCurrentDiagram = getViewFromCurrentDiagram;