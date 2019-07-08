const OpenApi = require('./src/openapi')
/**
 * @function _handleGenerate
 * @description OpenAPI generation when OpenAPI Initialization  
 * @param {UMLPackage} umlPackage
 * @param {string} path
 * @param {Object} options
 */
function _handleGenerate(umlPackage, path, options) {
     // If options is not passed, get from preference
     options = options || getGenOptions();
     // If umlPackage is not assigned, popup ElementPicker
     if (!umlPackage) {
          app.elementPickerDialog
               .showDialog("Select the package or project to generate from", null, null) //type.UMLPackage
               .then(function({
                    buttonId,
                    returnValue
               }) {
                    if (buttonId === "ok") {
                         if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                              umlPackage = returnValue;
                              fileTypeSelection(umlPackage, options);
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
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function fileTypeSelection(umlPackage, options) {
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
          fileType
     }) {
          if (buttonId === 'ok') {
               const basePath = app.dialogs.showSaveDialog("Save File as...", null, filters);
               const mOpenApi = new OpenApi(umlPackage, basePath, options,fileType);
               mOpenApi.initUMLPackage();
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