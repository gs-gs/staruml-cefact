var forEach = require('async-foreach').forEach;
/**
 * @function isString
 * @description returns boolean that checks values is string or any object
 * @returns {boolean}
 */
function isString(s) {
     return typeof (s) === 'string' || s instanceof String;
}
var notAvailableClassOrEnumeInFile = [];

function resetNotAvailableClassOrEnumeInFile() {
     notAvailableClassOrEnumeInFile = [];
}

function getNotAvailableClassOrEnumeInFile() {
     return notAvailableClassOrEnumeInFile;
}

function showDialogForNotAvailableClassOrEnum() {
     let notAvail = getNotAvailableClassOrEnumeInFile();
     if (notAvail.length > 0) {

          let dlgMessage = 'Warning: your vocabulary may be invalid because following properties have unknown or undefined type (range):\n';
          forEach(notAvail, function (item) {
               dlgMessage += '\n' + item;
          });
          app.dialogs.showAlertDialog(dlgMessage);
     }
}

function addNotAvailableClassOrEnumeInFile(str) {
     notAvailableClassOrEnumeInFile.push(str);
}

function checkAndaddNotAvailableClassOrEnumeInFile(className,attr,attributeType) {
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
module.exports.isString = isString;
module.exports.resetNotAvailableClassOrEnumeInFile = resetNotAvailableClassOrEnumeInFile;
module.exports.getNotAvailableClassOrEnumeInFile = getNotAvailableClassOrEnumeInFile;
module.exports.showDialogForNotAvailableClassOrEnum = showDialogForNotAvailableClassOrEnum;
module.exports.addNotAvailableClassOrEnumeInFile = addNotAvailableClassOrEnumeInFile;
module.exports.checkAndaddNotAvailableClassOrEnumeInFile = checkAndaddNotAvailableClassOrEnumeInFile;