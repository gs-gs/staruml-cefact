const codeGenerator = require('./src/code-generator')
/**
 * @function _handleGenerate
 * @description OpenAPI generation when OpenAPI Initialization  
 * @param {UMLPackage} baseModel
 * @param {string} path
 * @param {Object} options
 */
function _handleGenerate(baseModel, path, options) {
     // If options is not passed, get from preference
     options = options || getGenOptions();
     // If baseModel is not assigned, popup ElementPicker
     if (!baseModel) {
          app.elementPickerDialog
               .showDialog("Select the package or project to generate from", null, null) //type.UMLPackage
               .then(function({
                    buttonId,
                    returnValue
               }) {
                    if (buttonId === "ok") {
                         if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                              baseModel = returnValue;
                              fileTypeSelection(baseModel, options);
                         } else {
                              app.dialogs.showErrorDialog("Please select the project or a package");
                         }
                    }
               });
     }
}

/**
 * @function fileTypeSelection
 * @description Selects file type from the dropdown
 * @param {UMLPackage} baseModel
 * @param {Object} options
 */
function fileTypeSelection(baseModel, options) {
     let filters = [
          // { name: "YML Files", extensions: [ "yml" ] }
     ];

     let fileOptions = [{
               text: "JSON",
               value: 1
          },
          {
               text: "YML",
               value: 2
          },
          {
               text: "BOTH",
               value: 3
          }
     ];
     app.dialogs.showSelectDropdownDialog("Select one of the following type.", fileOptions).then(function({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {
               const file = app.dialogs.showSaveDialog("Save File as...", null, filters);
               codeGenerator.generate(baseModel, file, options, returnValue);
          } else {
               console.log("User canceled")
          }
     });
}

const PREF_DEBUG_KEY = "openapi:debug.status";
const PREF_GENDOC = "openapi.gen.idlDoc";
const PREF_INDENTSPC = "openapi.gen.indentSpaces";

/**
 * @function getGenOptions
 * @description Get options from the preferences
 * @returns {Object}
 */
function getGenOptions() {
     return {
          idlDoc: app.preferences.get(PREF_GENDOC),
          indentSpaces: [],
          debug: app.preferences.get(PREF_DEBUG_KEY)
     };
}
/**
 * @function init
 * @description OpenAPI Initialization
 */
function init() {
     app.commands.register('openapi:show-toast', _handleGenerate);
}

exports.init = init