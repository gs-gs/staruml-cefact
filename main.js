const openAPI = require('./src/openapi');
var asyncLoop = require('node-async-loop');
const constant = require('./src/constant');
var fs = require('fs');
var path = require('path');
const $RefParser = require("json-schema-ref-parser");
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
const title=require('./package.json').title;
const description=require('./package.json').description;

// var mdjson = require('metadata-json');
/**
 * @function _handleGenerate
 * @description OpenAPI generation when OpenAPI Initialization  
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function _handleGenerate(umlPackage, options = getGenOptions()) {
     // If options is not passed, get from preference
     openAPI.setAppMode(openAPI.APP_MODE_GEN); //0 mode for Generate API
     // If umlPackage is not assigned, popup ElementPicker
     if (!umlPackage) {
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
 * @description Selects file type from the dropdown
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function fileTypeSelection(umlPackage, options) {

     let fileOptions = [
          {
               text: "JSON & YML",
               value: 3
          },{
               text: "JSON",
               value: 1
          },
          {
               text: "YML",
               value: 2
          },
          
     ];
     app.dialogs.showSelectDropdownDialog(constant.msg_file_select, fileOptions).then(function ({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {
               const basePath = app.dialogs.showSaveDialog(constant.msg_file_saveas, null, null);
               const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, returnValue);

               mOpenApi.initUMLPackage();

          } else {
               console.log("User canceled")
          }
     });
}

/**
 * @function getGenOptions
 * @description Get options from the preferences
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
 * @function getPackageOptions
 * @param {Array} ownedElements
 * @description Returns the array of Package list 
 * @returns {Array}
 */
function getPackageOptions(ownedElements) {
     let umlPackageList = [];
     ownedElements.filter((item, index) => {

          if (item instanceof type.UMLPackage) {
               var mObject = {};
               mObject.text = item.name;
               mObject.value = index;
               umlPackageList.push(mObject);





          }
     });
     return umlPackageList;
}


/**
 * @function _handleTestExtension
 * @description Handle test case for valid OpenApi Specification
 */
function _handleTestExtension() {

     // "/home/vi109/Desktop/Identity-API.json/IdentityAPI.json"
     

     // console.log(parser);
     
     // await parser.dereference('/home/vi109/Desktop/Identity-API.yml');
     // if (parser.$refs.circular) {
     //   console.log('The API contains circular references');
     // }

     // fs.readFile('/home/vi109/Desktop/Identity-API.json/IdentityAPI.json', function (err, contents) {
     //      if (err){
     //            return console.error(err);
     //      }
     //      var data = JSON.parse(contents);
     //     console.log('readObject',data);
     //     $RefParser.dereference(data.components, (err, schema) => {
     //      if (err) {
     //        console.error('Refparser',err);
     //      }
     //      else {
     //        // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
     //        // including referenced files, combined into a single object
     //        console.log('Refparser',schema);
     //      }
     //    });
     //  });

     // openAPI.validateSwagger("/home/vi109/Desktop/Identity-API.json/IdentityAPI.json").then(data => {
     //      console.log(data)
     // })
     // .catch(error => {
     //      app.dialogs.showErrorDialog(error.message);
     //      console.log(error)
     // });

     // $RefParser.dereference('/home/vi109/Desktop/Identity-API.json/IdentityAPI.json', (err, schema) => {
     //      if (err) {
     //        console.error('Refparser',err);
     //      }
     //      else {
     //        // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
     //        // including referenced files, combined into a single object
     //        console.log('Refparser','success');
     //      }
     //    });

     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     openAPI.setTestMode(openAPI.TEST_MODE_SINGLE);
     app.elementPickerDialog
               .showDialog(constant.DIALOG_MSG_TEST_PICKERDIALOG, null, null) //type.UMLPackage
               .then(function ({
                    buttonId,
                    returnValue
               }) {
                    if (buttonId === "ok") {
                         if (returnValue instanceof type.Project || returnValue instanceof type.UMLPackage) { //|| returnValue instanceof type.UMLPackage
                              umlPackage = returnValue;
                              testSinglePackage(umlPackage);

                         } else {
                              app.dialogs.showErrorDialog(constant.DIALOG_MSG_ERRORDIALOG);
                         }
                    }
               });
}
/**
 * @function removeOutputFiles
 * @description Removes previously test generated .json files from the output folder
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
 * @function testSinglePackage
 * @params {UMLPackage} item
 * @description Test Single Package 
 */
function testSinglePackage(item) {
     removeOutputFiles();
     generateTestAPI(item)
}
/**
 * @function testAllPackage
 * @params {UMLPackage} item
 * @description Test All Packages of Project
 */
function testAllPackage(item) {


     removeOutputFiles();

     let strSummery='';
     asyncLoop(item, function (umlPackage, next) {
          setTimeout(function () {
               generateTestAPI(umlPackage)
               next();
          }, 1000);

     }, function (err) {
          if (err) {
               console.error('Error: ' + err.message);
               return;
          }else{

               setTimeout(function () {
                    let summery=openAPI.getSummery();
                    
                    summery.filter((item, index) => {
          
                         strSummery+=item.message+'\n\n';
                    });
                    app.dialogs.showAlertDialog(strSummery);
               }, 1500);
          }
     });
}

/**
 * @function generateTestAPI
 * @params {UMLPackage} umlPackage
 * @description Generate test api 
 * */
async function generateTestAPI(umlPackage) {

     const basePath = __dirname + constant.IDEAL_TEST_FILE_PATH;
     // const umlPackage = testPkgList[0];
     const options = getGenOptions();

     const mOpenApi = new openAPI.OpenApi(umlPackage, basePath, options, 1);
     await mOpenApi.initUMLPackage();

}
/**
 * @function _handleTestExtension
 * @description Handle test case for valid OpenApi Specification
 */
function _handleAllTestPackages() {
     var packages = app.repository.select("@UMLPackage")

     openAPI.resetSummery();
     openAPI.setAppMode(openAPI.APP_MODE_TEST);
     openAPI.setTestMode(openAPI.TEST_MODE_ALL);
     
     let mPackages=[];
     packages.forEach(element => {
          if (element instanceof type.UMLPackage) {
               mPackages.push(element);
          }
     });
     testAllPackage(mPackages);
}
function _handleAboutUsExtension(){
     console.log('Project',app.repository.select("@Project"));
     // returns elements of type.Project: [Project]

     console.log('UMLClass',app.repository.select("@UMLClass"));
     // returns elements of type.UMLClass: [Book, Author]

     console.log('IdentityAPI',app.repository.select("IdentityAPI")[0]);
     console.log('classes',app.repository.select("IdentityAPI::@UMLClass"));
     console.log('interfaces',app.repository.select("IdentityAPI::@UMLInterface"));
     
     console.log(app);
     app.dialogs.showInfoDialog(title+"\n\n"+description);
}
/**
 * @function init
 * @description OpenAPI Initialization
 */
function init() {
     app.commands.register('generate:show-toast', _handleGenerate);
     app.commands.register('testextension:test-extension', _handleTestExtension)
     app.commands.register('testallextension:test-all-extension', _handleAllTestPackages)
     app.commands.register('generate:show-about-ext', _handleAboutUsExtension)
}

exports.init = init