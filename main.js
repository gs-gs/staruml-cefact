
const codeGenerator = require('./code-generator')

function _handleGenerate(base, path, options) {
  // If options is not passed, get from preference
  options = options || getGenOptions();
  // If base is not assigned, popup ElementPicker
  if (!base) {
    app.elementPickerDialog
      .showDialog("Select the package to generate from", null, null)  //type.UMLPackage
      .then(function({ buttonId, returnValue }) {
         if (buttonId === "ok") {
          if (returnValue instanceof type.Project ) { //|| returnValue instanceof type.UMLPackage
            base = returnValue;
            console.log(base,path,options);
          //  openFolder(base, path, options);
          const file = app.dialogs.showSaveDialog("Save File as...", null, "schema_" + base.name + ".yml");
      
          codeGenerator.generate(base,file,options);
          } else {
            app.dialogs.showErrorDialog("Please select the project or a package");
          }
        }
      });
  } else {
  //  openFolder(base, path, options);
  }
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
  app.commands.register('openapi:show-toast', _handleGenerate)
}

exports.init = init