const openAPI = require('./src/openapi');
var asyncLoop = require('node-async-loop');
const constant = require('./src/constant');
var fs = require('fs');
var path = require('path');
const title = require('./package.json').title;
const description = require('./package.json').description;
const xmi21writer = require('./src/xmi21writer')

/**
 * @function generateSpecs
 * @description Generates OpenAPI Specification When user select generate specs from Tools->OpenAPI-> Generate Specs
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function generateSpecs(umlPackage, options = getGenOptions()) {
     // There are two modes of extension, TEST & GENERATE. Here we set APP_MODE_GEN.
     openAPI.setAppMode(openAPI.APP_MODE_GEN); //0 mode for Generate API
     // If umlPackage is not assigned, popup ElementPicker
     if (!umlPackage) {
          // Open element picker dialog to pick package 
          app.elementPickerDialog
               .showDialog(constant.DIALOG_MSG_PICKERDIALOG, null, null) //type.UMLPackage
               .then(function ({
                    buttonId,
                    returnValue
               }) {
                    if (buttonId === "ok") {
                         if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                              umlPackage = returnValue;
                              fileTypeSelection(umlPackage, options);
                         } else {
                              app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERRORDIALOG);
                         }
                    }
               });
     }
}

/**
 * @function fileTypeSelection
 * @description Display dropdown dialog and allow user to select file type from dropdown dailog like (JSON & YAML, JSON, YAML)
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function fileTypeSelection(umlPackage, options) {

     app.dialogs.showSelectDropdownDialog(constant.msg_file_select, constant.fileOptions).then(function ({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {
               const basePath = app.dialogs.showSaveDialog(constant.msg_file_saveas, null, null);
               if (basePath != null) {
                    const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, returnValue);
                    mOpenApi.initUMLPackage();
               } else {
                    console.log("Dialog cancelled")
               }
          } else {
               console.log("Dialog cancelled")
          }
     });
}

/**
 * @function getGenOptions
 * @description returns the app preferences stored by user
 * @returns {Object} 
 */
function getGenOptions() {
     return {
          idlDoc: app.preferences.get(constant.PREF_GENDOC),
          indentSpaces: [],
          debug: app.preferences.get(constant.PREF_DEBUG_KEY)
     };
}

/**
 * @function testSinglePackage
 * @description Test single package which user has selected from elementPickerDialog
 */
function testSinglePackage() {

     // There are two modes of extension, TEST & GENERATE. Here we set TEST mode.
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     // There are two modes of TEST, TEST_MODE_SINGLE & TEST_MODE_ALL. Here we set TEST_MODE_SINGLE)
     openAPI.setTestMode(openAPI.TEST_MODE_SINGLE);
     // Open element picker dialog to pick package 
     app.elementPickerDialog
          .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null) //type.UMLPackage
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {
                    if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                         umlPackage = returnValue;
                         removeOutputFiles();
                         generateTestAPI(umlPackage)

                    } else {
                         app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERRORDIALOG);
                    }
               }
          });
}

/**
 * @function removeOutputFiles
 * @description Remove previously test generated .json files from the output folder
 */
function removeOutputFiles() {
     const directory = __dirname + constant.IDEAL_TEST_FILE_PATH;

     if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
     }

     fs.readdir(directory, (err, files) => {
          if (err) throw err;

          for (const file of files) {
               fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
               });
          }
     });
}

/**
 * @function starTestingAllPackage
 * @description Start testing all packages one by one of the project
 * @params {UMLPackage} item
 */
function starTestingAllPackage(item) {


     removeOutputFiles();

     let strSummery = '';
     asyncLoop(item, function (umlPackage, next) {
          setTimeout(function () {
               generateTestAPI(umlPackage)
               next();
          }, 1000);

     }, function (err) {
          if (err) {
               console.error('Error: ' + err.message);
               return;
          } else {

               setTimeout(function () {
                    let summery = openAPI.getSummery();

                    let status = 'success';
                    summery.filter((item, index) => {
                         if (item.status == 'failure') {
                              status = 'failure'
                         }
                         strSummery += item.message + '\n\n';
                    });
                    if (status == 'success') {
                         app.dialogs.showInfoDialog(strSummery);
                    } else {
                         app.dialogs.showErrorDialog(strSummery);
                    }

               }, 1500);
          }
     });
}

/**
 * @function generateTestAPI
 * @params {UMLPackage} umlPackage
 * @description Async function to generate test api 
 * */
async function generateTestAPI(umlPackage) {

     const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
     // const umlPackage = testPkgList[0];
     const options = getGenOptions();

     const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, 1);
     await mOpenApi.initUMLPackage();

}

/**
 * @function testEntireProject
 * @description Test Entire Project for valid OpenApi Specifications
 */
function testEntireProject() {
     var packages = app.repository.select("@UMLPackage")

     // reset old stored error summery
     openAPI.resetSummery();
     // There are two modes of extension, TEST & GENERATE. Here we set APP_MODE_TEST.
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     // There are two modes of TEST, TEST_MODE_SINGLE & TEST_MODE_ALL. Here we set TEST_MODE_ALL)
     openAPI.setTestMode(openAPI.TEST_MODE_ALL);

     let mPackages = [];
     packages.forEach(element => {
          if (element instanceof type.UMLPackage) {
               mPackages.push(element);
          }
     });
     starTestingAllPackage(mPackages);
}

/**
 * @function aboutUsExtension
 * @description Display Information about Extension like the title and description of OpenAPI Specification.
 */
function aboutUsExtension() {
     app.dialogs.showInfoDialog(title + "\n\n" + description);
}
const XMI_FILE_FILTERS = [{
          name: 'XMI Files',
          extensions: ['xmi']
     },
     {
          name: 'All Files',
          extensions: ['*']
     }
]
/**
 * @function exportPkg
 * @description 
 */
function exportPkg() {
     app.elementPickerDialog
          .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null) //type.UMLPackage
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {
                    if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                         umlPackage = returnValue;
                         console.log("Selected Package", umlPackage);
                         var _filename = umlPackage.name
                         // var _filename = app.project.getProject().name

                         var filename = app.dialogs.showSaveDialog('Export Project As XMI', _filename + '.xmi', XMI_FILE_FILTERS)
                         if (filename) {
                              // xmi21writer.saveToFile(filename);
                              xmi21writer.savePackageToFile(umlPackage,filename);
                         }

                    } else {
                         app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERRORDIALOG);
                    }
               }
          });
}
/**
 * @function exportPkg
 * @description 
 */
function exportFragment() {
     app.elementPickerDialog
          .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null) //type.UMLPackage
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {
                    if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                         umlPackage = returnValue;
                         console.log("Selected Package", umlPackage);
                         var _filename = umlPackage.name
                         // var _filename = app.project.getProject().name

                         var filename = app.dialogs.showSaveDialog('Export Project As XMI', _filename + '.xmi', XMI_FILE_FILTERS)
                         if (filename) {
                              // xmi21writer.saveToFile(filename);
                              xmi21writer.savePackageToFile(umlPackage,filename);
                         }

                    } else {
                         app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERRORDIALOG);
                    }
               }
          });
}
/**
 * @function init
 * @description function will be called when the extension is loaded
 */
function init() {
     // Register command to Generate Specification
     app.commands.register('openapi:generate-specs', generateSpecs);
     // Register command to Test Single Pacakge
     app.commands.register('openapi:test-single-package', testSinglePackage);
     // Register command to Test Entire Project
     app.commands.register('openapi:test-entire-package', testEntireProject);
     // Register command to Display Extension information in dialog
     app.commands.register('openapi:about-us', aboutUsExtension);
     // app.preferences.register(javaPreferences);
     // app.commands.register('openapi:export-pkg', exportPkg);
     app.commands.register('openapi:export-pkg', exportFragment);
     
}

exports.init = init