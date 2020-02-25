var forEach = require('async-foreach').forEach;
var constant = require('./constant');

var notAvailableAttribute = [];
var notLinkedType = [];
/**
 * @function resetNotAvailableClassOrEnumeInFile
 * @description reset not available classes which is referenced in attribute type
 */
function resetNotAvailableClassOrEnumeInFile() {
     notAvailableAttribute = [];
}

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

function getNotLinkedType() {
     return notLinkedType;
}
/**
 * @function showDialogNotAvailableAttribute
 * @description display alert dialog if not available classes 
 * @returns {Array}
 */
function showDialogNotAvailableAttribute() {
     let notAvailElement = getNotAvailableAttribute();
     if (notAvailElement.length > 0) {

          let dlgMessage = constant.STR_WARNING_VOCABULARY;
          forEach(notAvailElement, function (item) {
               dlgMessage += '\n' + item;
          });
          app.dialogs.showAlertDialog(dlgMessage);
     }
}

function showDialogNotLinkedType() {
     let mNotLinkedType = getNotLinkedType();
     if (mNotLinkedType.length > 0) {

          let dlgMessage = constant.DATA_TYPE_NOTE_LINKED_ERROR;
          forEach(mNotLinkedType, function (item) {
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
     let result = notAvailableAttribute.filter(function (msg) {
          return msg == str;
     });
     if (result.length != 0) {
          return;
     }
     notAvailableAttribute.push(str);
}

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