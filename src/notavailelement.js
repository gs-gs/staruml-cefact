const openAPI = require('../src/openapi');
const jsonld = require('../src/jsonld/jsonld');
var forEach = require('async-foreach').forEach;
var constant = require('./constant');
var fs = require('fs');
var path = require('path');
var invalidAttributeType = [];
var notLinkedType = [];
/**
 * @function resetNotAvailableClassOrEnumeInFile
 * @description reset not available classes which is referenced in attribute type
 */
function resetNotAvailableClassOrEnumeInFile() {
     invalidAttributeType = [];
}

/**
 * @function resetNotLinkedType
 * @description reset list of not linked types
 */
function resetNotLinkedType() {
     notLinkedType = [];
}

/**
 * @function getInvalidAttributeType
 * @description returns array of not available classes which is referenced in attribute type
 * @returns {Array}
 */
function getInvalidAttributeType() {
     return invalidAttributeType;
}

/**
 * @function getNotLinkedType
 * @description returns list of not linked types
 * @returns {Array}
 */
function getNotLinkedType() {
     return notLinkedType;
}
const nodeUtils = require('util');
/**
 * @function showDialogInvalidAttributeType
 * @description display alert dialog if not available classes 
 * @returns {Array}
 */
function showDialogInvalidAttributeType() {

     let eleName = '';
     let selType = '';
     if (openAPI.getAppMode() == openAPI.APP_MODE_JSONLD) {
          eleName = jsonld.getExportElementName();
          selType = constant.STR_PACKAGE;
     } else {
          eleName = openAPI.getExportElementName();
          selType = openAPI.isModelPackage() ? constant.STR_PACKAGE : constant.STR_DIAGRAM;
     }
     let notAvailElement = getInvalidAttributeType();
     if (notAvailElement.length > 0) {

          let dlgMessage = nodeUtils.format(constant.STR_WARNING_VOCABULARY, eleName, selType);
          /* Display maximum 20 lines in alert. The rest lines write in separate file  */
          forEach(notAvailElement, function (item, index) {
               if (index < constant.MAX_LINES) {
                    dlgMessage += '\n' + item;
               }
          });
          if (notAvailElement.length > constant.MAX_LINES) {
               let basePath = __dirname + constant.IDEAL_VOCAB_ERROR_PATH;
               basePath = path.join(basePath, eleName + "_" + constant.VOCABS_FILE_NAME);
               let writeMsgs = '';
               forEach(notAvailElement, function (item) {
                    writeMsgs += item + '\n';
               });
               let _mdirname = path.dirname(basePath);
               if (!fs.existsSync(_mdirname)) {
                    fs.mkdirSync(_mdirname);
               }
               fs.writeFile(basePath, writeMsgs, function (err) {
                    if (err) {
                         console.error("Error : ", err.message);
                         app.dialogs.showErrorDialog(err.message);
                         return;
                    }
               });
               dlgMessage += '\n\n\n' + constant.MSG_MORE_VOCABS + basePath;
          }


          app.dialogs.showAlertDialog(dlgMessage);

     }
}

/**
 * @function showDialogNotLinkedType
 * @description display alert dialog that for not linked types
 */
function showDialogNotLinkedType() {
     let eleName = '';
     let selType = '';
     if (openAPI.getAppMode() == openAPI.APP_MODE_JSONLD) {
          eleName = jsonld.getExportElementName();
          selType = constant.STR_PACKAGE;
     } else {
          eleName = openAPI.getExportElementName();
          selType = openAPI.isModelPackage() ? constant.STR_PACKAGE : constant.STR_DIAGRAM;
     }

     let mNotLinkedType = getNotLinkedType();
     if (mNotLinkedType.length > 0) {

          let dlgMessage = nodeUtils.format(constant.DATA_TYPE_NOTE_LINKED_ERROR, eleName, selType);
          /* Display maximum 20 lines in alert. The rest lines write in separate file  */
          forEach(mNotLinkedType, function (item, index) {
               if (index < constant.MAX_LINES) {
                    dlgMessage += '\n' + item;
               }
          });

          if (mNotLinkedType.length > constant.MAX_LINES) {
               let basePath = __dirname + constant.IDEAL_VOCAB_ERROR_PATH;
               basePath = path.join(basePath, eleName + "_" + constant.NOT_LINKED_TYPE_FILE_NAME);
               let writeMsgs = '';
               forEach(mNotLinkedType, function (item) {
                    writeMsgs += item + '\n';
               });
               let _mdirname = path.dirname(basePath);
               if (!fs.existsSync(_mdirname)) {
                    fs.mkdirSync(_mdirname);
               }
               fs.writeFile(basePath, writeMsgs, function (err) {
                    if (err) {
                         console.error("Error : ", err.message);
                         app.dialogs.showErrorDialog(err.message);
                         return;
                    }
               });
               dlgMessage += '\n\n\n' + constant.MSG_MORE_NOT_LINKED_TYPE + basePath;
          }

          app.dialogs.showAlertDialog(dlgMessage);
     }
}


/**
 * @function addNotAvailableClassOrEnumeInFile
 * @param (string) str
 * @description add not available classes
 */
function addNotAvailableClassOrEnumeInFile(str) {
     /* check and avoid inserting duplicate msg  */
     let result = invalidAttributeType.filter(function (msg) {
          return msg == str;
     });
     if (result.length != 0) {
          return;
     }
     invalidAttributeType.push(str);
}

/**
 * @function addNotLinkedTypeClass
 * @param {string} str
 * @description avoid duplication and adds not linked type to notlinkedtype array 
 */
function addNotLinkedTypeClass(str) {
     /* check and avoid inserting duplicate msg  */
     let result = notLinkedType.filter(function (msg) {
          return msg == str;
     });
     if (result.length != 0) {
          return;
     }
     notLinkedType.push(str);
}

/**
 * @function addNotLinkedType
 * @param {string} className
 * @param {UMLAttribute} attr
 * @param {string} attributeType
 * @description add not linked type to notlinkedtype array 
 */
function addNotLinkedType(className, attr, attributeType) {
     let str = className + '/' + attr.name + ': ' + attributeType
     addNotLinkedTypeClass(str);

}

/**
 * @function addInvalidAttributeType
 * @param {string} className
 * @param {UMLAttribute} attr
 * @param {string} attributeType
 * @description add not available classes
 */
function addInvalidAttributeType(className, attr, attributeType) {
     /* let srchRes = app.repository.search(attributeType);
     let result = srchRes.filter(function (element) {
          if (element instanceof type.UMLClass || element instanceof type.UMLEnumeration) {
               return element.name == attributeType;
          }
     });
     if (result.length == 0) { */
     let str = className + '/' + attr.name + ': ' + attributeType
     addNotAvailableClassOrEnumeInFile(str);
     /* } */

}

/**
 * @function isAvailable
 * @param {string} className
 * @description check that UMLClass or UMLEnumeration available of name like className. If element available return true or false
 * @returns {boolean} 
 */
function isAvailable(className) {
     let srchRes = app.repository.search(className);
     let result = srchRes.filter(function (element) {
          if (element instanceof type.UMLClass || element instanceof type.UMLEnumeration) {
               return element.name == className;
          }
     });
     if (result.length == 0) {
          return false;
     }
     return true;

}

module.exports.resetNotAvailableClassOrEnumeInFile = resetNotAvailableClassOrEnumeInFile;
module.exports.getInvalidAttributeType = getInvalidAttributeType;
module.exports.showDialogInvalidAttributeType = showDialogInvalidAttributeType;
module.exports.showDialogNotLinkedType = showDialogNotLinkedType;
module.exports.addNotAvailableClassOrEnumeInFile = addNotAvailableClassOrEnumeInFile;
module.exports.addInvalidAttributeType = addInvalidAttributeType;
module.exports.isAvailabl = isAvailable;
module.exports.addNotLinkedType = addNotLinkedType;
module.exports.resetNotLinkedType = resetNotLinkedType;