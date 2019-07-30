const openAPI = require('./src/openapi');
var asyncLoop = require('node-async-loop');
const constant = require('./src/constant');
var fs = require('fs');
var path = require('path');

// var mdjson = require('metadata-json');
/**
 * @function _handleGenerate
 * @description OpenAPI generation when OpenAPI Initialization  
 * @param {UMLPackage} umlPackage
 * @param {Object} options
 */
function _handleGenerate(umlPackage, options = getGenOptions()) {
     // If options is not passed, get from preference

     openAPI.setMode(0); //0 mode for Generate API
     // If umlPackage is not assigned, popup ElementPicker
     if (!umlPackage) {
          app.elementPickerDialog
               .showDialog("Select the package or project to generate from", null, null) //type.UMLPackage
               .then(function ({
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
 * @function getAllPackageOptions
 * @param {Array} ownedElements
 * @description Returns the array of All Package list 
 * @returns {Array}
 */
function getAllPackageOptions(ownedElements) {
     let umlPackageList = [];
     ownedElements.filter((item, index) => {

          if (item instanceof type.UMLPackage) {


               // item.ownedElements.filter((item, index) => {

                    // if (item instanceof type.UMLPackage) {

                         umlPackageList.push(item);

                    // }

               // });
          }
     });
     return umlPackageList;
}
function hasSubPackages(item){
     testPkgList=[];
     item.ownedElements.filter((item, index) => {

          if (item instanceof type.UMLPackage) {
               testPkgList.push(item);
          }
     });
     if(testPkgList.length==0){
          return false;
     }
     else{
          return true;
     }
}
/**
 * @function _handleTestExtension
 * @description Handle test case for valid OpenApi Specification
 */
function _handleTestExtension() {

     openAPI.setMode(1); //1 mode for Test API
     console.log("Main Object", app.project.project.ownedElements);
     let umlPackageList = getPackageOptions(app.project.project.ownedElements);
     var mObject = {};
     mObject.text = "ALL";
     mObject.value = umlPackageList.length;
     umlPackageList.push(mObject);

     let testPkgList = app.project.project.ownedElements;
     app.dialogs.showSelectDropdownDialog(constant.msg_package_select, umlPackageList).then(function ({
          buttonId,
          returnValue
     }) {
          if (buttonId === 'ok') {





               let selPackage = umlPackageList[returnValue];
               if (selPackage.text == 'ALL') {
                    testPkgList = getAllPackageOptions(app.project.project.ownedElements);
                    console.log("Package selected", testPkgList);
                    let tmpPkgList=[];
                    testPkgList.filter((item, index) => {

                         if (item instanceof type.UMLPackage) {
                              // tmpPkgList=[];
                              // testPkgList.push(item);  
                              if(hasSubPackages(item)){
                                   
                                   item.ownedElements.filter((item, index) => {

                                        if (item instanceof type.UMLPackage) {
                                             tmpPkgList.push(item);
                                        }
                                   });
                              }
                              else{
                                   tmpPkgList.push(item);  
                              }
                         }
                    });


                    testApi(2, tmpPkgList);
               } else {
                    testPkgList.filter((item, index) => {

                         if (item.name == selPackage.text && (item instanceof type.UMLPackage)) {
                              testPkgList=[];
                              // testPkgList.push(item);  
                              if(hasSubPackages(item)){
                                   
                                   item.ownedElements.filter((item, index) => {

                                        if (item instanceof type.UMLPackage) {
                                             testPkgList.push(item);
                                        }
                                   });
                              }
                              else{
                                   testPkgList.push(item);  
                              }
                         }
                    });

                    umlPackageList = getPackageOptions(testPkgList);
                    if (umlPackageList.length == 0) {
                         app.toast.info(constant.msgpackage);
                         return;
                    } else if (umlPackageList.length == 1 && !hasSubPackages(testPkgList[0])) {
                         // if(!hasSubPackages(testPkgList[0])){
                              testApi(1, testPkgList[0]);
                         // }
                         // let tempTest = [];
                         // testPkgList[0].ownedElements.filter((item, index) => {

                         //      if (item instanceof type.UMLPackage) {
                         //           tempTest.push(item);
                         //      }
                         // });
                         // if (tempTest.length == 0) {
                         //      testApi(1, testPkgList[0]);
                         // }
                    } else {
                         app.dialogs.showSelectDropdownDialog(constant.msg_package_select, umlPackageList).then(function ({
                              buttonId,
                              returnValue
                         }) {
                              if (buttonId === 'ok') {

                                   selPackage = umlPackageList[returnValue];

                                   testPkgList.filter((item, index) => {

                                        if (item.name == selPackage.text && (item instanceof type.UMLPackage)) {

                                             console.log("Package selected", item);
                                             console.log("testPkgList", testPkgList);

                                             testApi(1, item);

                                        }
                                   });
                              }
                         });
                    }
               }






          } else {
               console.log("Package Cancelled")
          }
     });
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
      * @function testApi
      * @params {Integer} type
      * @params {UMLPackage} item
      * @description Test selected package 
      */
     function testApi(type, item) {


          removeOutputFiles();

          if (type == 1) {
               generateTestAPI(item)
          } else if (type == 2) {

               asyncLoop(item, function (umlPackage, next) {
                    setTimeout(function () {
                         generateTestAPI(umlPackage)
                         next();
                    }, 1000);

               }, function (err) {
                    if (err) {
                         console.error('Error: ' + err.message);
                         return;
                    }

                    console.log('Finished!');
               });


          }
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



}
/**
 * @function init
 * @description OpenAPI Initialization
 */
function init() {
     app.commands.register('generate:show-toast', _handleGenerate);
     app.commands.register('testextension:test-extension', _handleTestExtension)
}

exports.init = init