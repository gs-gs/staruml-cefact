var forEach = require('async-foreach').forEach;

var notAvailableClassOrEnumeInFile = [];

function resetNotAvailableClassOrEnumeInFile() {
     notAvailableClassOrEnumeInFile = [];
}

function getNotAvailableClassOrEnumeInFile() {
     return notAvailableClassOrEnumeInFile;
}

function showDialogForNotAvailableClassOrEnum() {
     let notAvailElement = getNotAvailableClassOrEnumeInFile();
     if (notAvailElement.length > 0) {

          let dlgMessage = 'Warning: your vocabulary may be invalid because following properties have unknown or undefined type (range):\n';
          forEach(notAvailElement, function (item) {
               dlgMessage += '\n' + item;
          });
          app.dialogs.showAlertDialog(dlgMessage);
     }
}

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

module.exports.resetNotAvailableClassOrEnumeInFile = resetNotAvailableClassOrEnumeInFile;
module.exports.getNotAvailableClassOrEnumeInFile = getNotAvailableClassOrEnumeInFile;
module.exports.showDialogForNotAvailableClassOrEnum = showDialogForNotAvailableClassOrEnum;
module.exports.addNotAvailableClassOrEnumeInFile = addNotAvailableClassOrEnumeInFile;
module.exports.checkAndaddNotAvailableClassOrEnumeInFile = checkAndaddNotAvailableClassOrEnumeInFile;