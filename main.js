const openAPI = require('./src/openapi');
const constant = require('./src/constant');
const jsonld = require('./src/schema/jsonld');
const FileGenerator = require('./src/filegenerator');
var fs = require('fs');
var path = require('path');
const title = require('./package.json').title;
const description = require('./package.json').description;
let vDialog = null;
var forEach = require('async-foreach').forEach;
var diagramEle = require('./src/diagram/diagramElement');
var utils = require('./src/utils');
const JSON_FILE_FILTERS = [{
     name: 'JSON File',
     extensions: ['json']
 }]


/**
 * @function generateSpecs
 * @description Generates OpenAPI Specification When user select generate specs from Tools->OpenAPI-> Generate Specs
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function generateSpecs(umlPackage, options = getGenOptions()) {
     /* There are two modes of extension, TEST & GENERATE. Here we set APP_MODE_GEN. */
     openAPI.setAppMode(openAPI.APP_MODE_GEN); /* 0 mode for Generate API */
     /* If umlPackage is not assigned, popup ElementPicker */
     if (!umlPackage) {
          /* Open element picker dialog to pick package */
          app.elementPickerDialog
               .showDialog(constant.DIALOG_MSG_PICKERDIALOG, null, null) /* type.UMLPackage */
               .then(function ({
                    buttonId,
                    returnValue
               }) {
                    if (buttonId === "ok") {
                         openAPI.setUMLPackageName(returnValue.name);
                         let varSel = returnValue.getClassName();
                         let valPackagename = type.UMLPackage.name;
                         let valClassDiagram = type.UMLClassDiagram.name;
                         if (varSel == valClassDiagram) {

                              openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
                              let tempPackage = diagramEle.filterUMLClassDiagram(returnValue);
                              let mNewDiagram = app.repository.readObject(tempPackage);
                              console.log(mNewDiagram);

                              fileTypeSelection(mNewDiagram, options);

                         } else if (varSel == valPackagename) {

                              openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);
                              umlPackage = returnValue;

                              if (!utils.isEmpty(umlPackage)) {
                                   fileTypeSelection(umlPackage, options);
                              } else {
                                   app.dialogs.showErrorDialog(constant.PACKAGE_SELECTION_ERROR);
                              }

                         } else {
                              app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERROR_SELECT_PACKAGE);
                         }
                    }
               });
     }
}

/**
 * @function startOpenApiGenerator
 * @description initialize package path directory, gets all element from package, generate openapi from package
 * @param {string} message
 * @param {UMLClassDiagram} tempPackage
 * @param {string} basePath
 * @param {Object} options
 * @param {integer} returnValue
 */
async function startOpenApiGenerator(message, tempPackage, basePath, options, returnValue) {
     const mOpenApi = new openAPI.OpenApi(tempPackage, basePath, options, returnValue);
     let dm = app.dialogs;
     vDialog = dm.showModalDialog("", constant.titleopenapi, message, [], true);

     try {
          let result = await mOpenApi.initUMLPackage()
          console.log("initialize", result);
          let resultElement = await mOpenApi.getModelElements();
          console.log("resultElement", resultElement);
          let resultGen = await mOpenApi.generateOpenAPI();
          console.log("resultGen", resultGen);
          if (resultGen.result == constant.FIELD_SUCCESS) {
               vDialog.close();
               setTimeout(function () {
                    app.dialogs.showInfoDialog(resultGen.message);
                    if (openAPI.isModelDiagram()) {
                         diagramEle.removeDiagram(tempPackage);
                    }

               }, 10);
               vDialog = null;
          }


     } catch (err) {
          vDialog.close();
          setTimeout(function () {
               app.dialogs.showErrorDialog(err.message);
               if (openAPI.isModelDiagram()) {
                    diagramEle.removeDiagram(tempPackage);
               }
               console.error("Error getUMLModel", err);
          }, 10);
     }
}

/**
 * @function fileTypeSelection
 * @description Display dropdown dialog and allow user to select file type from dropdown dailog like (JSON & YAML, JSON, YAML)
 * @param {UMLPackage} umljPackage
 * @param {Object} options
 */
function fileTypeSelection(tempPackage, options) {

     app.dialogs.showSelectDropdownDialog(constant.msg_file_select, constant.fileOptions).then(function ({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {
               const basePath = app.dialogs.showSaveDialog(constant.msg_file_saveas, null, null);
               if (basePath != null) {

                    setTimeout(function () {
                         let message = '';
                         if (openAPI.isModelPackage()) {
                              message = "Please wait untill OpenAPI spec generation is being processed for the \'" + tempPackage.name + "\' package";
                         } else if (openAPI.isModelDiagram()) {
                              message = "Please wait untill OpenAPI spec generation is being processed for the \'" + tempPackage.name + "\' diagram";
                         }
                         startOpenApiGenerator(message, tempPackage, basePath, options, returnValue);
                    }, 10);

               } else {
                    console.log("Dialog cancelled : basePath not available")
               }
          } else {
               console.log("Dialog cancelled")
          }
     });
}

/**
 * @function selectPkgDiagram
 * @description Display dropdown dialog and allow user to select 'Diagram or Package'
 * @param {UMLPackage} umljPackage
 * @param {Object} options
 */
function selectPkgDiagram() {

     app.dialogs.showSelectDropdownDialog(constant.msg_pkg_diagram_select, constant.pkgOptions).then(function ({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {
               if (returnValue == 1 /* for Package */ ) {
                    testEntirePackage();
               } else if (returnValue == 2 /* for Diagram */ ) {
                    testEntireDiagram();
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

     /* There are two modes of extension, TEST & GENERATE. Here we set TEST mode. */
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     /* There are two modes of TEST, TEST_MODE_SINGLE & TEST_MODE_ALL. Here we set TEST_MODE_SINGLE) */
     openAPI.setTestMode(openAPI.TEST_MODE_SINGLE);
     /* Open element picker dialog to pick package */
     app.elementPickerDialog
          .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null) /* type.UMLPackage */
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {
                    openAPI.setUMLPackageName(returnValue.name);
                    let varSel = returnValue.getClassName();
                    let valPackagename = type.UMLPackage.name;
                    let valClassDiagram = type.UMLClassDiagram.name;
                    if (varSel == valClassDiagram) {

                         openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
                         let tempPackage = diagramEle.filterUMLClassDiagram(returnValue);
                         let mNewDiagram = app.repository.readObject(tempPackage);
                         removeOutputFiles();
                         let message = "Please wait untill OpenAPI spec generation is being tested for the \'" + mNewDiagram.name + "\' diagram";
                         setTimeout(function () {
                              testSingleOpenAPI(message, mNewDiagram);
                         }, 10);

                    } else if (varSel == valPackagename) {
                         openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);
                         umlPackage = returnValue;
                         let ownedElements = [];
                         umlPackage.ownedElements.filter(function (item) {
                              if (item instanceof type.UMLClass ||
                                   item instanceof type.UMLInterface ||
                                   item instanceof type.UMLEnumeration) {

                                   ownedElements.push(item);
                              }
                         });
                         if (ownedElements.length > 0) {
                              removeOutputFiles();

                              let message = "Please wait untill OpenAPI spec generation is being tested for the \'" + umlPackage.name + "\' package";
                              setTimeout(function () {
                                   testSingleOpenAPI(message, umlPackage);
                              }, 10);
                         } else {
                              app.dialogs.showErrorDialog(constant.PACKAGE_SELECTION_ERROR);
                         }

                    } else {
                         app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERROR_SELECT_PACKAGE);
                    }
               }
          });

}

/**
 * @function removeOutputFiles
 * @description Remove previously test generated .json files from the output folder
 */
function removeOutputFiles() {
     /* return new Promise((resolve, reject) => { */


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
async function starTestingAllDiagram(diagramList) {
     let strModeType = ' for Diagram : ';
     removeOutputFiles();
     let strSummery = '';
     for (const mUMLDiagram of diagramList) {
          openAPI.setUMLPackageName(mUMLDiagram.name);
          const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
          const options = getGenOptions();
          openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
          let tempPackage = diagramEle.filterUMLClassDiagram(mUMLDiagram);
          let mNewDiagram = app.repository.readObject(tempPackage);
          const mOpenApi = new openAPI.OpenApi(mNewDiagram, basePath, options, 1);
          try {
               let result = await mOpenApi.initUMLPackage()
               console.log("initialize", result);
               let resultElement = await mOpenApi.getModelElements();
               console.log("resultElement", resultElement);
               let resultGen = await mOpenApi.generateOpenAPI();
               console.log("resultGen", resultGen);
               if (resultGen.result == constant.FIELD_SUCCESS) {
                    diagramEle.removeDiagram(mNewDiagram);
               }
          } catch (err) {
               console.error("Error startTestingAllPackage", err);
               if (openAPI.getError().hasOwnProperty('isDuplicate') && openAPI.getError().isDuplicate == true) {
                    let arrPath = openAPI.findHierarchy(mUMLDiagram);
                    let pkgPath = openAPI.reversePkgPath(arrPath);
                    let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getUMLPackageName() + '\' {' + pkgPath + '}' + '\n' + constant.strerror + openAPI.getError().msg;
                    openAPI.addSummery(bindFailureMsg, 'failure');
               }
               diagramEle.removeDiagram(mNewDiagram);
          }
     }
     vDialog.close();
     vDialog = null;
     setTimeout(function () {
          console.log('Done!');
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
     }, 10);
}

/**
 * @function starTestingAllPackage
 * @description Start testing all packages one by one of the project
 * @params {UMLPackage} item
 */
async function starTestingAllPackage(pkgList) {
     let strModeType = ' for Package : ';

     removeOutputFiles();

     let strSummery = '';

     for (const umlPackage of pkgList) {
          openAPI.setUMLPackageName(umlPackage.name);
          const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
          const options = getGenOptions();
          const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, 1);
          try {
               let result = await mOpenApi.initUMLPackage()
               console.log("initialize", result);
               let resultElement = await mOpenApi.getModelElements();
               console.log("resultElement", resultElement);
               let resultGen = await mOpenApi.generateOpenAPI();
               console.log("resultGen", resultGen);

          } catch (err) {
               /*  app.dialogs.showErrorDialog(err.message); */
               console.error("Error startTestingAllPackage", err);
               if (openAPI.getError().hasOwnProperty('isDuplicate') && openAPI.getError().isDuplicate == true) {

                    let arrPath = openAPI.findHierarchy(umlPackage);
                    let pkgPath = openAPI.reversePkgPath(arrPath);

                    let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getUMLPackageName() + '\' {' + pkgPath + '}' + '\n' + constant.strerror + openAPI.getError().msg;
                    openAPI.addSummery(bindFailureMsg, 'failure');
               }
          }
     }
     vDialog.close();
     vDialog = null;
     setTimeout(function () {

          console.log('Done!');
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
     }, 10);
}

/**
 * @function testSingleOpenAPI
 * @params {UMLPackage} umlPackage
 * @description Async function to generate test api 
 * */
async function testSingleOpenAPI(message, umlPackage) {

     const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
     const options = getGenOptions();
     startOpenApiGenerator(message, umlPackage, basePath, options, 1);
}

/**
 * @function testEntirePackage
 * @description Test Entire Project for all packages available in model for valid OpenApi Specifications
 */
function testEntirePackage() {

     openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);
     var packages = app.repository.select("@UMLPackage")

     /* reset old stored error summery */
     openAPI.resetSummery();
     /* There are two modes of extension, TEST & GENERATE. Here we set APP_MODE_TEST. */
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     /* There are two modes of TEST, TEST_MODE_SINGLE & TEST_MODE_ALL. Here we set TEST_MODE_ALL) */
     openAPI.setTestMode(openAPI.TEST_MODE_ALL);

     let mPackages = [];
     packages.forEach(element => {
          if (element instanceof type.UMLPackage) {
               mPackages.push(element);
          }
     });
     vDialog = null;
     let dm = app.dialogs;
     vDialog = dm.showModalDialog("", constant.titleopenapi, "Please wait untill OpenAPI spec testing is being processed for the entire project.", [], true);
     setTimeout(function () {
          starTestingAllPackage(mPackages);
     }, 10);
}

/**
 * @function testEntireDiagram
 * @description Test Entire Project for all diagrams available in model for valid OpenApi Specifications
 */
function testEntireDiagram() {

     openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
     var umlClassDiagram = app.repository.select("@UMLClassDiagram")

     /* reset old stored error summery */
     openAPI.resetSummery();
     /* There are two modes of extension, TEST & GENERATE. Here we set APP_MODE_TEST. */
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     /* There are two modes of TEST, TEST_MODE_SINGLE & TEST_MODE_ALL. Here we set TEST_MODE_ALL) */
     openAPI.setTestMode(openAPI.TEST_MODE_ALL);

     let mUMLDiagrams = [];
     umlClassDiagram.forEach(element => {
          if (element instanceof type.UMLClassDiagram) {
               mUMLDiagrams.push(element);
          }
     });
     vDialog = null;
     let dm = app.dialogs;
     vDialog = dm.showModalDialog("", constant.titleopenapi, "Please wait untill OpenAPI spec testing is being processed for the entire diagram.", [], true);
     setTimeout(function () {
          starTestingAllDiagram(mUMLDiagrams);
     }, 10);
}

/**
 * @function aboutUsExtension
 * @description Display Information about Extension like the title and description of OpenAPI Specification.
 */
function aboutUsExtension() {
     app.dialogs.showInfoDialog(title + "\n\n" + description);
}
/**
 * @function aboutUsExtension
 * @description Display Information about Extension like the title and description of OpenAPI Specification.
 */
function generateJSONLD() {

     /* Open element picker dialog to pick package */
     app.elementPickerDialog
          .showDialog(constant.JSONLD_MSG_PICKERDIALOG, null, null) /* type.UMLPackage */
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {

                    
                    



                    let varSel = returnValue.getClassName();
                    let valPackagename = type.UMLPackage.name;
                    if (varSel == valPackagename) {

                         if (!utils.isEmpty(returnValue)) {



                              var _filename = returnValue.name;
                              var basePath = app.dialogs.showSaveDialog('Export JSON-LD As JSON', _filename+'-jsonld' + '.json', JSON_FILE_FILTERS);
                              if (basePath == null) {
                                   console.log("Dialog cancelled : basePath not available")
                                   return;
                              }

                              console.log("generateJSONLD");
                              jsonld.setUMLPackage(returnValue);
                              let objJSONLd = jsonld.generateJSONLD();
                              let generator = new FileGenerator();
                              generator.createJSONLD(basePath,objJSONLd).then(function(res){
                                   if(res.result==constant.FIELD_SUCCESS){
                                        app.dialogs.showInfoDialog(res.message);
                                   }
                              }).catch(function (err) {
                                   app.dialogs.showErrorDialog(err.message);
                              });;
                              console.log(objJSONLd);
                         } else {
                              app.dialogs.showErrorDialog(constant.PACKAGE_SELECTION_ERROR);
                         }
                    } else {
                         app.dialogs.showErrorDialog(constant.JSONLD_MSG_PICKERDIALOG);
                    }
               }
          });

}
/**
 * @function init
 * @description function will be called when the extension is loaded
 */
function init() {
     /* Register command to Generate Specification */
     app.commands.register('openapi:generate-specs', generateSpecs);
     /* Register command to Test Single Pacakge */
     app.commands.register('openapi:test-single-package', testSinglePackage /* swaggerTest */ );
     /* Register command to Test Entire Project */
     app.commands.register('openapi:test-entire-package', selectPkgDiagram);
     /* Register command to Display Extension information in dialog */
     app.commands.register('openapi:about-us', aboutUsExtension);
     /* Register command to Generate Generate JSON-LD Specification */
     app.commands.register('jsonld:generate', generateJSONLD);

}

exports.init = init