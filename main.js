const nodeUtils = require('util');
const openAPI = require('./src/openapi');
const constant = require('./src/constant');
const jsonld = require('./src/jsonld/jsonld');
const FileGenerator = require('./src/filegenerator');
var fs = require('fs');
var path = require('path');
const title = require('./package.json').title;
const description = require('./package.json').description;
let vDialog = null;
var forEach = require('async-foreach').forEach;
var dElement = require('./src/diagram/dElement');
var utils = require('./src/utils');

var notAvailElement = require('./src/notavailelement');
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
function genSpecs(umlPackage, options = getGenOptions()) {
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

                         let exportElement = returnValue;
                         openAPI.setExportElementName(exportElement.name);
                         let varSel = exportElement.getClassName();
                         let valPackagename = type.UMLPackage.name;
                         let valClassDiagram = type.UMLClassDiagram.name;

                         let eleTypeStr = '';
                         if (varSel == valClassDiagram) {
                              eleTypeStr = constant.STR_DIAGRAM
                              openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
                              dElement.filterUMLClassDiagram(exportElement);
                         } else if (varSel == valPackagename) {
                              eleTypeStr = constant.STR_PACKAGE;
                              openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);
                         } else {
                              app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERROR_SELECT_PACKAGE);
                              return;
                         }

                         if (utils.isEmpty(exportElement)) {
                              let str = nodeUtils.format(constant.PACKAGE_SELECTION_ERROR, eleTypeStr, eleTypeStr);
                              app.dialogs.showErrorDialog(str);
                              return;
                         }

                         const options = getGenOptions();
                         fileTypeSelection(exportElement, options);
                    }
               });
     }
}

/**
 * @function startOpenApiGenerator
 * @description initialize package path directory, gets all element from package, generate openapi from package
 * @param {string} message
 * @param {UMLClassDiagram} exportElement
 * @param {string} basePath
 * @param {Object} options
 * @param {integer} returnValue
 */
async function startOpenApiGenerator(message, exportElement, basePath, options, returnValue) {
     const mOpenApi = new openAPI.OpenApi(exportElement, basePath, options, returnValue);
     let dm = app.dialogs;
     vDialog = dm.showModalDialog("", constant.titleopenapi, message, [], true);

     setTimeout(async function(){

          try {
               let result = await mOpenApi.initUMLPackage()
               console.log("initialized Package", result);
               let resultElement = await mOpenApi.getModelElements();
               console.log("initialized Model Elements", resultElement);
               let resultGen = await mOpenApi.generateOpenAPI();
               console.log("result : OpenAPI Generated", resultGen);
               if (resultGen.result == constant.FIELD_SUCCESS) {
                    vDialog.close();
                    setTimeout(function () {
                         app.dialogs.showInfoDialog(resultGen.message);
                    }, 10);
                    vDialog = null;
               }
               
               
          } catch (err) {
               vDialog.close();
               setTimeout(function () {
                    app.dialogs.showErrorDialog(err.message);
                    console.error("Error getUMLModel", err);
               }, 10);
          }
     },0);
}

/**
 * @function fileTypeSelection
 * @description Display dropdown dialog and allow user to select file type from dropdown dailog like (JSON & YAML, JSON, YAML)
 * @param {UMLPackage} umljPackage
 * @param {Object} options
 */
function fileTypeSelection(tempExportElement, options) {

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
                              message = nodeUtils.format(constant.PROGRESS_MSG, tempExportElement.name, constant.STR_PACKAGE);
                         } else if (openAPI.isModelDiagram()) {
                              message = nodeUtils.format(constant.PROGRESS_MSG, tempExportElement.name, constant.STR_DIAGRAM);
                         }
                         startOpenApiGenerator(message, tempExportElement, basePath, options, returnValue);
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
          .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null)
          .then(function ({
               buttonId,
               returnValue
          }) {
               if (buttonId === "ok") {
                    let exportElement = returnValue;
                    openAPI.setExportElementName(exportElement.name);
                    let varSel = exportElement.getClassName();
                    let valPackagename = type.UMLPackage.name;
                    let valClassDiagram = type.UMLClassDiagram.name;

                    let message = '';
                    let eleTypeStr = '';
                    if (varSel == valClassDiagram) {
                         eleTypeStr = constant.STR_DIAGRAM;
                         openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
                         dElement.filterUMLClassDiagram(exportElement);
                    } else if (varSel == valPackagename) {
                         eleTypeStr = constant.STR_PACKAGE;
                         openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);
                    } else {
                         app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERROR_SELECT_PACKAGE);
                         return;
                    }
                    
                    message = nodeUtils.format(constant.PROGRESS_MSG, exportElement.name, eleTypeStr);
                    if (utils.isEmpty(exportElement)) {
                         let str = nodeUtils.format(constant.PACKAGE_SELECTION_ERROR, eleTypeStr, eleTypeStr);
                         app.dialogs.showErrorDialog(str);
                         return;
                    }

                    const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
                    const options = getGenOptions();
                    startOpenApiGenerator(message, exportElement, basePath, options, 1);
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
          openAPI.setExportElementName(mUMLDiagram.name);
          const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
          const options = getGenOptions();
          openAPI.setModelType(openAPI.APP_MODEL_DIAGRAM);
          dElement.filterUMLClassDiagram(mUMLDiagram);
          const mOpenApi = new openAPI.OpenApi(mUMLDiagram, basePath, options, 1);
          try {
               let result = await mOpenApi.initUMLPackage()
               console.log("initialized Package", result);
               let resultElement = await mOpenApi.getModelElements();
               console.log("initialized Model Elements", resultElement);
               let resultGen = await mOpenApi.generateOpenAPI();
               console.log("result : OpenAPI Generated", resultGen);
          } catch (err) {
               console.error("Error startTestingAllPackage", err);
               if (openAPI.getError().hasOwnProperty('isDuplicate') && openAPI.getError().isDuplicate == true) {
                    let arrPath = openAPI.findHierarchy(mUMLDiagram);
                    let pkgPath = openAPI.reversePkgPath(arrPath);
                    let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + pkgPath + '}' + '\n' + constant.strerror + openAPI.getError().msg;
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
 * @function starTestingAllPackage
 * @description Start testing all packages one by one of the project
 * @params {UMLPackage} item
 */
async function starTestingAllPackage(pkgList) {
     let strModeType = ' for Package : ';

     removeOutputFiles();

     let strSummery = '';

     for (const umlPackage of pkgList) {
          openAPI.setExportElementName(umlPackage.name);
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

                    let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + pkgPath + '}' + '\n' + constant.strerror + openAPI.getError().msg;
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
     vDialog = dm.showModalDialog("", constant.titleopenapi, constant.PROGRESS_MSG_ENTIRE_PROJECT, [], true);
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
     vDialog = dm.showModalDialog("", constant.titleopenapi, constant.PROGRESS_MSG_ENTIRE_PROJECT, [], true);
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
     /* 
     // Script to change multiplicity from '1' to '0..1'
     let allAttrib=app.repository.select("@UMLAttribute");
     let attribMulticiplityOne=allAttrib.filter(function(attrib){
          return attrib.multiplicity==="1";
     });
     forEach(attribMulticiplityOne,function(attrib){
          app.engine.setProperty(attrib,"multiplicity","0..1");
     }); */
}
/**
 * @function aboutUsExtension
 * @description Display Information about Extension like the title and description of OpenAPI Specification.
 */
function genJSONLD() {

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
                              var basePath = app.dialogs.showSaveDialog('Export JSON-LD As JSON', _filename + '-vocabulary' + '.json', JSON_FILE_FILTERS);
                              if (basePath == null) {
                                   console.log("Dialog cancelled : basePath not available")
                                   return;
                              }

                              console.log("generateJSONLD");
                              jsonld.setExportElement(returnValue);
                              notAvailElement.resetNotAvailableClassOrEnumeInFile();
                              let objJSONLd = jsonld.generateJSONLD();

                              /* Will alert dialog for not availabel class or enume in file */
                              notAvailElement.showDialogNotAvailableAttribute();

                              let generator = new FileGenerator();
                              generator.createJSONLD(basePath, objJSONLd).then(function (res) {
                                   if (res.result == constant.FIELD_SUCCESS) {
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
     app.commands.register('openapi:generate-specs', genSpecs);
     /* Register command to Test Single Pacakge */
     app.commands.register('openapi:test-single-package', testSinglePackage /* swaggerTest */ );
     /* Register command to Test Entire Project */
     app.commands.register('openapi:test-entire-package', selectPkgDiagram);
     /* Register command to Display Extension information in dialog */
     app.commands.register('openapi:about-us', aboutUsExtension);
     /* Register command to Generate Generate JSON-LD Specification */
     app.commands.register('jsonld:generate', genJSONLD);

     app.project.on('projectLoaded', utils.initCoreTypes);
     app.project.on('projectLoaded', utils.initJsonRuleType);
}

exports.init = init