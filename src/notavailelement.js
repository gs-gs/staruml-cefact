const openAPI = require('../src/openapi');
var forEach = require('async-foreach').forEach;
var constant = require('./constant');
var fs = require('fs');
var path = require('path');
var notAvailableAttribute = [];
var notLinkedType = [];
/**
 * @function resetNotAvailableClassOrEnumeInFile
 * @description reset not available classes which is referenced in attribute type
 */
function resetNotAvailableClassOrEnumeInFile() {
     notAvailableAttribute = [];
}

/**
 * @function resetNotLinkedType
 * @description reset list of not linked types
 */
function resetNotLinkedType() {
     notLinkedType = [];
}

/**
 * @function getNotAvailableAttribute
 * @description returns array of not available classes which is referenced in attribute type
 * @returns {Array}
 */
function getNotAvailableAttribute() {
     return notAvailableAttribute;
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
 * @function showDialogNotAvailableAttribute
 * @description display alert dialog if not available classes 
 * @returns {Array}
 */
function showDialogNotAvailableAttribute() {
     let notAvailElement = getNotAvailableAttribute();
     if (notAvailElement.length > 0) {

          let dlgMessage = nodeUtils.format(constant.STR_WARNING_VOCABULARY, openAPI.getExportElementName(), openAPI.isModelPackage()?constant.STR_PACKAGE:constant.STR_DIAGRAM);
          /* Display maximum 20 lines in alert. The rest lines write in separate file  */
          forEach(notAvailElement, function (item, index) {
               if (index < constant.MAX_LINES) {
                    dlgMessage += '\n' + item;
               }
          });
          if (notAvailElement.length > constant.MAX_LINES) {
               let basePath = __dirname + constant.IDEAL_VOCAB_ERROR_PATH;
               basePath = path.join(basePath, openAPI.getExportElementName()+"_"+constant.VOCABS_FILE_NAME);
               let writeMsgs = '';
               forEach(notAvailElement, function (item) {
                    writeMsgs += item + '\n';
               });
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
     let mNotLinkedType = getNotLinkedType();
     if (mNotLinkedType.length > 0) {

          let dlgMessage = nodeUtils.format(constant.DATA_TYPE_NOTE_LINKED_ERROR, openAPI.getExportElementName(), openAPI.isModelPackage()?constant.STR_PACKAGE:constant.STR_DIAGRAM);
          /* Display maximum 20 lines in alert. The rest lines write in separate file  */
          forEach(mNotLinkedType, function (item, index) {
               if (index < constant.MAX_LINES) {
                    dlgMessage += '\n' + item;
               }
          });

          if (mNotLinkedType.length > constant.MAX_LINES) {
               let basePath = __dirname + constant.IDEAL_VOCAB_ERROR_PATH;
               basePath = path.join(basePath, openAPI.getExportElementName()+"_"+constant.NOT_LINKED_TYPE_FILE_NAME);
               let writeMsgs = '';
               forEach(mNotLinkedType, function (item) {
                    writeMsgs += item + '\n';
               });
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
     let result = notAvailableAttribute.filter(function (msg) {
          return msg == str;
     });
     if (result.length != 0) {
          return;
     }
     notAvailableAttribute.push(str);
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
 * @function addNotAvailableAttribute
 * @param {string} className
 * @param {UMLAttribute} attr
 * @param {string} attributeType
 * @description add not available classes
 */
function addNotAvailableAttribute(className, attr, attributeType) {
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
module.exports.getNotAvailableAttribute = getNotAvailableAttribute;
module.exports.showDialogNotAvailableAttribute = showDialogNotAvailableAttribute;
module.exports.showDialogNotLinkedType = showDialogNotLinkedType;
module.exports.addNotAvailableClassOrEnumeInFile = addNotAvailableClassOrEnumeInFile;
module.exports.addNotAvailableAttribute = addNotAvailableAttribute;
module.exports.isAvailabl = isAvailable;
module.exports.addNotLinkedType = addNotLinkedType;
module.exports.resetNotLinkedType = resetNotLinkedType;