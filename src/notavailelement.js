var forEach = require('async-foreach').forEach;
var constant = require('./constant');

var notAvailableClassOrEnumeInFile = [];
/**
 * @function resetNotAvailableClassOrEnumeInFile
 * @description reset not available classes which is referenced in attribute type
 */
function resetNotAvailableClassOrEnumeInFile() {
     notAvailableClassOrEnumeInFile = [];
}

/**
 * @function getNotAvailableClassOrEnumeInFile
 * @description returns array of not available classes which is referenced in attribute type
 * @returns {Array}
 */
function getNotAvailableClassOrEnumeInFile() {
     return notAvailableClassOrEnumeInFile;
}

/**
 * @function showDialogForNotAvailableClassOrEnum
 * @description display alert dialog if not available classes 
 * @returns {Array}
 */
function showDialogForNotAvailableClassOrEnum() {
     let notAvailElement = getNotAvailableClassOrEnumeInFile();
     if (notAvailElement.length > 0) {

          let dlgMessage = constant.STR_WARNING_VOCABULARY;
          forEach(notAvailElement, function (item) {
               dlgMessage += '\n' + item;
          });
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
     let result = notAvailableClassOrEnumeInFile.filter(function (msg) {
          return msg == str;
     });
     if (result.length != 0) {
          return;
     }
     notAvailableClassOrEnumeInFile.push(str);
}

/**
 * @function checkAndaddNotAvailableClassOrEnumeInFile
 * @param {string} className
 * @param {UMLAttribute} attr
 * @param {string} attributeType
 * @description add not available classes
 */
function checkAndaddNotAvailableClassOrEnumeInFile(className, attr, attributeType) {
     let srchRes = app.repository.search(attributeType);
     let result = srchRes.filter(function (element) {
          if (element instanceof type.UMLClass || element instanceof type.UMLEnumeration) {
               return element.name == attributeType;
          }
     });
     if (result.length == 0) {
          let str = className + '/' + attr.name + ': ' + attributeType
          addNotAvailableClassOrEnumeInFile(str);
     }

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
module.exports.getNotAvailableClassOrEnumeInFile = getNotAvailableClassOrEnumeInFile;
module.exports.showDialogForNotAvailableClassOrEnum = showDialogForNotAvailableClassOrEnum;
module.exports.addNotAvailableClassOrEnumeInFile = addNotAvailableClassOrEnumeInFile;
module.exports.checkAndaddNotAvailableClassOrEnumeInFile = checkAndaddNotAvailableClassOrEnumeInFile;
module.exports.isAvailabl = isAvailable;