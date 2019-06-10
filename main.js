
const codeGenerator = require('./code-generator')

function _handleGenerate(base, path, options) {
  // If options is not passed, get from preference
  options = options || getGenOptions();
  // If base is not assigned, popup ElementPicker
  if (!base) {
    app.elementPickerDialog
      .showDialog("Select the package or project to generate from", null, null)  //type.UMLPackage
      .then(function({ buttonId, returnValue }) {
         if (buttonId === "ok") {
          if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
            base = returnValue;            
            fileTypeSelection(base,options);
          } else {
            app.dialogs.showErrorDialog("Please select the project or a package");
          }
        }
      });
  } 
}

function fileTypeSelection(base,options){
  let filters = [
    // { name: "YML Files", extensions: [ "yml" ] }
  ];

  let fileOptions = [
    { text: "JSON", value: 1 },
    { text: "YML", value: 2 },
    { text: "BOTH", value: 3 }
  ];
  app.dialogs.showSelectDropdownDialog("Select one of the following type.", fileOptions).then(function ({buttonId,returnValue}) {
    if (buttonId === 'ok') {
      const file = app.dialogs.showSaveDialog("Save File as...", null, filters);
      codeGenerator.generate(base,file,options,returnValue);
    } else {
      console.log("User canceled")
    }
  });
}

const PREF_DEBUG_KEY = "openapi:debug.status";
const PREF_GENDOC = "openapi.gen.idlDoc";
const PREF_INDENTSPC = "openapi.gen.indentSpaces";

function getGenOptions() {
  return {
    idlDoc: app.preferences.get(PREF_GENDOC),
    indentSpaces: app.preferences.get(PREF_INDENTSPC),
    debug: app.preferences.get(PREF_DEBUG_KEY)
  };
}

function init () {
  app.commands.register('openapi:show-toast', _handleGenerate);
}

exports.init = init