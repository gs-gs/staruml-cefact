const fs = require('fs');
const Info = require('./info');
const Component = require('./component');
const Utils = require('./utils');
const FileGenerator = require('./filegenerator');
const Paths = require('./paths');
const Servers = require('./servers');
const MainJSON = require('./mainjson');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
var forEach = require('async-foreach').forEach;
/* var filterAsync = require('node-filter-async'); */
/**
 * @class OpenApi 
 * @description class returns the OpenAPI
 */
class OpenApi {

     /**
      * @constructor Creates an instance of OpenApi.
      * @param {UMLPackage} umlPackage
      * @param {string} basePath
      * @param {Object} options
      * @param {integer} fileType
      * @memberof OpenAPI
      */
     constructor(umlPackage, basePath, options, fileType) {
          OpenApi.umlPackage = umlPackage;
          OpenApi.filePath = basePath;
          this.options = options;
          this.schemas = [];
          this.pkgPath = [];
          OpenApi.operations = [];
          this.utils = new Utils();
          OpenApi.fileType = fileType;
          OpenApi.uniqueClassesArr = [];
          OpenApi.strPackagePath = '';

          OpenApi.error = {};
          /* OpenApi.isDuplicate=false; */
          /* OpenApi.duplicateClasses = []; */

     }


     /**
      * @function initUMLPackage
      * @description initializes UML Package
      * @memberof OpenAPI
      */
     initUMLPackage() {
          try {
               try {
                    if (!fs.existsSync(OpenApi.filePath)) {
                         fs.mkdirSync(OpenApi.filePath);
                    }
               } catch (err) {
                    console.error(err)
               }

               if (OpenApi.umlPackage instanceof type.UMLPackage) {
                    this.getUMLModels();
               } else {
                    OpenApi.umlPackage.ownedElements.forEach(element => {
                         if (element instanceof type.UMLPackage) {
                              this.getUMLModels();
                         }
                    });
               }
          } catch (_e) {
               console.error(_e);
               app.toast.error("Generation Failed!");
          }
     }

     getElements() {

          let _this = this;
          if (Array.isArray(OpenApi.umlPackage.ownedElements)) {
               OpenApi.umlPackage.ownedElements.forEach(child => {
                    if (child instanceof type.UMLClass) {
                         setTimeout(function () {
                              _this.findClass(child);
                         }, 10);
                    } else if (child instanceof type.UMLInterface) {
                         OpenApi.operations.push(child);
                    } else if (child instanceof type.UMLGeneralization) {
                         setTimeout(function () {
                              _this.findClass(child);
                         }, 5);
                    } else if (child instanceof type.UMLClassDiagram) {
                         let arClassesFromView = [];
                         child.ownedViews.forEach(item => {
                              if (item instanceof type.UMLClassView && item.model instanceof type.UMLClass) {
                                   arClassesFromView.push(item.model);
                              }
                         });
                         // console.log("arClassesFromView", arClassesFromView);
                    }
               });
          }



     }

     findElements(umlClass, resolve, reject) {
          try {
               let _this = this;
               _this.schemas.push(umlClass);
               if (umlClass.ownedElements.length > 0) {
                    umlClass.ownedElements.forEach(child => {
                         if (child instanceof type.UMLAssociation) {
                              if (child.end1.reference.name != child.end2.reference.name) {
                                   setTimeout(function () {
                                        _this.findElements(child.end2.reference, resolve, reject);
                                   }, 5);
                              }
                         } else if (child instanceof type.UMLClass) {
                              setTimeout(function () {
                                   _this.findElements(child, resolve, reject);
                              }, 5);
                         } else if (child instanceof type.UMLGeneralization) {
                              setTimeout(function () {
                                   _this.findElements(child.target, resolve, reject);
                              }, 5);
                         }
                    });
               } else {
                    resolve("success");
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
               reject(error);
          }
     }
     handleFindClass(umlClass) {
          let _this = this;
          return new Promise((resolve, reject) => {
               _this.findElements(umlClass, resolve, reject);
          });
     }
     ifDone() {

          let _this = this;


          try {

               let resArr = [];


               _this.schemas.forEach(item => {
                    let filter = resArr.filter(subItem => {
                         return subItem._id == item._id;
                    });
                    if (filter.length == 0) {
                         resArr.push(item);
                    }

               });
               setTimeout(function () {

                    resArr.sort(function (a, b) {
                         return a.name.localeCompare(b.name);
                    });
                    let uniqueArr = [];
                    let duplicateClasses = [];
                    let isDuplicate = false;

                    forEach(resArr, function (item, index, arr) {
                         let filter = uniqueArr.filter(subItem => {
                              return item.name == subItem.name;
                         });

                         if (filter.length == 0) {
                              uniqueArr.push(item);
                         } else {
                              isDuplicate = true;
                              duplicateClasses.push(item.name);
                              let firstElem = uniqueArr.indexOf(filter[0]);
                              uniqueArr[firstElem].attributes = uniqueArr[firstElem].attributes.concat(item.attributes);
                              uniqueArr[firstElem].ownedElements = uniqueArr[firstElem].ownedElements.concat(item.ownedElements);
                         }
                         OpenApi.uniqueClassesArr = uniqueArr;

                    }, function (notAborted, arr) {
                         setTimeout(function () {
                              // _this.getOtherWay();
                              if (!isDuplicate) {
                                   /* console.log("uniqueaRR", OpenApi.uniqueClassesArr); */

                                   let mClasses = [];
                                   OpenApi.uniqueClassesArr.forEach(element => {
                                        mClasses.push(element.name);
                                   });
                                   console.log("uniqueaClasses", mClasses);
                                   let mPaths = [];
                                   OpenApi.operations.forEach(element => {
                                        mPaths.push(element.name);
                                   });
                                   console.log("uniqueaPath", mPaths);

                                   _this.generateOpenAPI();
                              } else {
                                   app.dialogs.showErrorDialog("There " + (duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + duplicateClasses.join() + (duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
                              }
                         }, 200);
                    });

               }, 1000);


          } catch (error) {
               console.error("Found error", error.message);
               _this.utils.writeErrorToFile(error);
          }
     }

     async getOtherWay() {

          let _this = this;
          let umlPackage = OpenApi.getPackage();
          /* console.log("Selected Package", umlPackage); */
          var _pkgName = umlPackage.name
          /* ------------ 1. UMLClass ------------ */
          let umlClasses = app.repository.select(_pkgName + "::@UMLClass");
          /* console.log("UMLClass", umlClasses); */

          OpenApi.operations = app.repository.select(_pkgName + "::@UMLInterface");
          /* console.log("UMLOperation", OpenApi.operations); */

          /* ------------ 2. Association Class------------ */
          /* console.log("--asso-start"); */
          let assocCurrentPkg = await OpenApi.getUMLAssociation();
          /* console.log(assocCurrentPkg); */
          /* console.log("--asso-end"); */

          /* console.log("assoc--1"); */
          let tmpAsso = [];
          forEach(assocCurrentPkg, (child, index) => {
               /* console.log("assoc--2"); */
               if (child.end1.reference.name != child.end2.reference.name) {

                    let filter = umlClasses.filter(subItem => {
                         return child.end2.reference.name == subItem.name;
                    });

                    if (filter.length == 0) {
                         umlClasses.push(child.end2.reference);
                         tmpAsso.push(child.end2.reference);
                    }
               }

          });
          /* console.log(tmpAsso); */
          /* console.log("assoc--3"); */
          /* ------------ 3. Generalization Class ------------ */

          /* console.log("--gen-start"); */
          let generaCurrentPkg = await OpenApi.getUMLGeneralization();
          /* console.log("--gen-end"); */

          /* console.log("gen--1"); */
          let tmpGen = [];
          forEach(generaCurrentPkg, (child, index) => {
               /* console.log("gen--2"); */
               let filter = umlClasses.filter(subItem => {
                    return child.target.name == subItem.name;
               });
               if (filter.length == 0) {
                    umlClasses.push(child.target);
                    tmpGen.push(child.target.name);
               }
          });
          /* console.log(tmpGen); */
          /* console.log("gen--3"); */


          /* ------------ 4. Filter unique classes ------------ */
          let resArr = [];
          /* console.log("fil-un-1"); */
          forEach(umlClasses, (item, index) => {
               /* console.log("fil-un-2"); */
               let filter = resArr.filter(subItem => {
                    /* console.log("fil-un-2-1"); */
                    return subItem._id == item._id;
               });
               if (filter.length == 0) {
                    resArr.push(item);
               }

          });
          /* console.log("fil-un-3"); */

          /* ------------ 5. Sort unique classes ------------ */
          /* console.log("sort-1"); */
          resArr.sort(function (a, b) {
               /* console.log("sort-2"); */
               return a.name.localeCompare(b.name);
          });
          /* console.log("sort-3"); */

          let uniqueArr = [];
          let duplicateClasses = [];
          let isDuplicate = false;


          /* console.log("sort-un-1"); */
          forEach(resArr, function (item, index) {
               /* console.log("sort-un--2"); */
               let filter = uniqueArr.filter(subItem => {
                    /* console.log("sort-un--2-1"); */
                    return item.name == subItem.name;
               });

               if (filter.length == 0) {
                    uniqueArr.push(item);
               } else {
                    isDuplicate = true;
                    duplicateClasses.push(item.name);
                    let firstElem = uniqueArr.indexOf(filter[0]);
                    uniqueArr[firstElem].attributes = uniqueArr[firstElem].attributes.concat(item.attributes);
                    uniqueArr[firstElem].ownedElements = uniqueArr[firstElem].ownedElements.concat(item.ownedElements);
               }
               OpenApi.uniqueClassesArr = uniqueArr;

          });
          /* console.log("sort-un--3"); */

          /* console.log("duplicate-1"); */
          if (!isDuplicate) {

               let mClasses = [];
               forEach(OpenApi.uniqueClassesArr, element => {
                    /* console.log("duplicate-2"); */
                    mClasses.push(element.name);
               });

               let mPaths = [];
               forEach(OpenApi.operations, element => {
                    mPaths.push(element.name);
               });

               console.log("Query Total Classes", mClasses);
               console.log("Query Total Interfaces", mPaths);

               _this.generateOpenAPI();
          } else {
               app.dialogs.showErrorDialog("There " + (duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + duplicateClasses.join() + (duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
          }
          /* console.log("duplicate-3"); */

     }
     /**
      * @function getUMLModels
      * @description get and stores UMLInterface, UMLClass & UMLGeneralization 
      * @memberof OpenAPI
      */
     async getUMLModels() {
          let _this = this;
          try {


               if (OpenApi.umlPackage instanceof type.UMLPackage) {
                    /*  _this.getElements();
                     setTimeout(function(){
                          _this.ifDone();
                          
                     },1000); */
                    // let umlAsso=await OpenApi.getUMLAssociation();
                    // setTimeout(function(){

                    // console.log("Common",umlAsso);
                    // },100);

                    _this.getOtherWay();


               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }


     /**
      * @function findClass
      * @description finds the element from the class
      * @param {UMLClass} elem
      * @memberof OpenAPI
      */
     findClass(umlClass) {
          try {
               let _this = this;
               _this.schemas.push(umlClass);
               // console.log("ABC---",umlClass.name);
               if (umlClass.ownedElements.length > 0) {
                    umlClass.ownedElements.forEach(child => {
                         if (child instanceof type.UMLAssociation) {
                              if (child.end1.reference.name != child.end2.reference.name) {
                                   setTimeout(function () {
                                        _this.findClass(child.end2.reference);
                                   }, 5);
                              }
                         } else if (child instanceof type.UMLClass) {
                              setTimeout(function () {
                                   _this.findClass(child);
                              }, 5);
                         } else if (child instanceof type.UMLGeneralization) {
                              setTimeout(function () {
                                   _this.findClass(child.target);
                              }, 5);
                         }
                    });
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }

     /**
      * @function setTestMode
      * @description set Extention test mode
      * @static
      * @memberof OpenApi
      */
     static setTestMode(testmode) {
          OpenApi.testmode = testmode;
     }

     /**
      * @function getTestMode
      * @description returns the Extention test mode
      * @static
      * @memberof OpenApi
      */
     static getTestMode() {
          return OpenApi.testmode;
     }

     /**
      * @function setAppMode
      * @description set Extention mode weather is in TEST(1) or GENERATE(0) MODE
      * @static
      * @memberof OpenApi
      */
     static setAppMode(mode) {
          OpenApi.mode = mode;
     }

     /**
      * @function getAppMode
      * @description returns the Extention mode weather is in TEST(1) or GENERATE(0) MODE
      * @static
      * @memberof OpenApi
      */
     static getAppMode() {
          return OpenApi.mode;
     }

     /**
      * @function setError
      * @description save error or warning to be shown to UI
      * @static
      * @memberof OpenApi
      */
     static setError(error) {
          OpenApi.error = error;
     }

     /**
      * @function getError
      * @description returns error or warning to be shown to UI
      * @static
      * @memberof OpenApi
      */
     static getError() {
          return OpenApi.error;
     }

     /**
      * @function getUniqueClasses
      * @description save and returns the array of unique classes
      * @static
      * @returns {Array}
      * @memberof OpenApi
      */
     static getUniqueClasses() {
          return OpenApi.uniqueClassesArr;
     }

     /**
      * @function getPath
      * @description returns filePath
      * @static
      * @returns {string}
      * @memberof OpenApi
      */
     static getPath() {
          return OpenApi.filePath;
     }

     /**
      * @function getPackage
      * @description returns UMLPackage
      * @static
      * @returns {UMLPackage}
      * @memberof OpenApi
      */
     static getPackage() {
          return OpenApi.umlPackage;
     }

     /**
      * @function getOperations
      * @description returns path operations
      * @static
      * @returns {operations}
      * @memberof OpenApi
      */
     static getOperations() {
          return OpenApi.operations;
     }

     /**
      * @function getType
      * @description returns fileType
      * @static
      * @returns {integer}
      * @memberof OpenApi
      */
     static getType() {
          return OpenApi.fileType;
     }

     /**
      * @function resetPackagePath
      * @description reset package path array
      * @memberof OpenApi
      */
     resetPackagePath() {
          this.pkgPath = [];
     }

     /**
      * @function getPackagepath
      * @description returns the stored package path
      * @static
      * @returns {string}
      * @memberof OpenApi
      */
     static getPackagePath() {
          return OpenApi.strPackagePath;
     }
     /**
      * @function setPackagepath
      * @description stores package path 
      * @static
      * @param {string} strPackagePath
      * @memberof OpenApi
      */
     static setPackagepath(strPackagePath) {
          OpenApi.strPackagePath = strPackagePath;
     }
     static async getUMLAssociation() {
          return new Promise((resolve, reject) => {

               let tmpAssociation = [];
               try {
                    let umlClasses = app.repository.select(OpenApi.getPackage().name + "::@UMLClass");
                    forEach(umlClasses, async (objClass, index) => {
                         let umlAssociation = app.repository.select(OpenApi.getPackage().name + "::" + objClass.name + "::@UMLAssociation");
                         /* console.log(objClass.name,umlAssociation); */
                         if (umlAssociation.length > 0) {
                              umlAssociation.forEach(function (element) {
                                   tmpAssociation.push(element);
                              });

                         }
                    });


                    resolve(tmpAssociation);
               } catch (error) {
                    console.error("Found error", error.message);
                    this.utils.writeErrorToFile(error);
               }


               /* let assocCurrentPkg = [];
               console.log("---1");
               forEach(associations, async (child, index) => {
                    console.log("---2");
                    let result = await OpenApi.getParentPkg(child);
                    if (result != null && result == OpenApi.getPackage().name && child.name != "") {
                         assocCurrentPkg.push(child);
                    }

               }); */
               /* console.log("---3"); */
               // resolve(associations);
               /* resolve(assocCurrentPkg); */
          });
     }
     static async getUMLGeneralization() {
          return new Promise((resolve, reject) => {

               let tmpGeneralization = [];
               try {
                    let umlClasses = app.repository.select(OpenApi.getPackage().name + "::@UMLClass");
                    forEach(umlClasses, async (objClass, index) => {
                         let umlGenera = app.repository.select(OpenApi.getPackage().name + "::" + objClass.name + "::@UMLGeneralization");
                         if (umlGenera.length > 0) {
                              umlGenera.forEach(function (element) {
                                   tmpGeneralization.push(element);
                              });
                         }
                    });


                    resolve(tmpGeneralization);
               } catch (error) {
                    console.error("Found error", error.message);
                    this.utils.writeErrorToFile(error);
               }
          });
     }
     /**
      * Finds the parent package of element from UMLModel
      *
      * @param {*} element
      * @returns
      * @memberof OpenApi
      */
     static async getParentPkg(element) {
          return await new Promise((resolve, reject) => {
               let result = OpenApi.getElementPackage(element);
               if (result != null) {
                    resolve(result);
               } else {
                    reject(null);
               }
          });
     }
     /**
      * @function getElementPackage
      * @description finds package of element
      * @param {Object} element
      * @returns {String}
      * @memberof OpenApi
      */
     static async getElementPackage(element) {
          if (element != null && element._parent != null && element.hasOwnProperty('_parent')) {

               element = element._parent;
               if (element instanceof type.UMLPackage && element.name != "") {
                    return element.name;
               } else {
                    return await this.getElementPackage(element);
               }
          } else {
               return null;
          }

     }
     /**
      * @function findHierarchy
      * @description finds the package hierarchy recursively
      * @param {UMLPackage} umlPackage
      * @returns {Array}
      * @memberof OpenApi
      */
     findHierarchy(umlPackage) {
          this.pkgPath.push(umlPackage.name);
          if (umlPackage.hasOwnProperty('_parent') && umlPackage._parent != null && umlPackage._parent instanceof type.UMLPackage) {

               this.findHierarchy(umlPackage._parent);
          }
          return this.pkgPath;
     }
     /**
      * @function reversePkgPath
      * @description returns the package path recursively
      * @returns {string}
      * @memberof OpenApi
      */
     reversePkgPath() {
          let str = '';
          for (let i = (this.pkgPath.length - 1); i >= 0; i--) {
               str += this.pkgPath[i] + '\\';
          }
          return str;
     }

     /**
      * @function generateOpenAPI
      * @description generate open api json object
      * @memberof OpenApi
      */
     async generateOpenAPI() {
          try {

               let _this=this;
               this.resetPackagePath();
               let arrPath = this.findHierarchy(OpenApi.getPackage());
               let rPath = this.reversePkgPath(arrPath);
               OpenApi.setPackagepath(rPath);


               /*  Add openapi version */
               MainJSON.addApiVersion('3.0.0');
               console.log("-----version-generated");

               /* Add openapi information */
               let mInfo = new Info();
               MainJSON.addInfo(mInfo);
               console.log("-----info-generated");

               /* Add openapi servers */
               let server = new Servers();
               MainJSON.addServers(server);
               console.log("-----server-generated");

               /* Add openapi paths */
               let paths = new Paths();
               MainJSON.addPaths(paths);
               console.log("-----path-generated");

               /* Add openapi component */
               let component = new Component();
               MainJSON.addComponent(component);
               console.log("-----component-generated");
               console.log(MainJSON.getJSON());
               let generator = new FileGenerator();
               let result = await generator.generate();
               console.log("Result", result);
               console.log("-----file-generated");
               await generator.validateAndPrompt();
               /* try {
                    console.log("Path : ",OpenApi.getPath());
                    if (fs.existsSync(OpenApi.getPath())) {
                         console.log("File : exist");
                    }
               } catch (err) {
                    console.error(err)
               } */
               


               




          } catch (error) {
               this.utils.writeErrorToFile(error);
          }
     }


}

let summeryMessages = [];
/**
 * @function addSummery
 * @description Stores test messages in summery to show at once after ALL test
 */
function addSummery(message, status) {
     let msg = {
          message: message,
          status: status
     }
     summeryMessages.push(msg);
}

/**
 * @function getSummery
 * @description returns Stored summery messages to show at once after ALL test
 * @returns {Array}
 */
function getSummery() {
     return summeryMessages;
}


/**
 * @function resetSummery
 * @description reset all stored summery
 */
function resetSummery() {
     summeryMessages = [];
}
/**
 * @function validateSwagger
 * @description Validate OpenAPI Specs from the file with swagger-parser
 * @param {string} pathValidator
 * @returns {Promise}
 */
function validateSwagger(pathValidator) {
     return new Promise((resolve, reject) => {

               try {
                    console.log("Filepath :",pathValidator);
                    if (fs.existsSync(pathValidator)) {
                         console.log("File exist");
                         setTimeout(function(){
                         parser.validate(pathValidator, (err, api) => {
                              if (err) {
                                   /* Error */
                                   reject(err);
                              } else {
                                   /* Success */
                                   resolve({
                                        message: "success"
                                   })
                              }
                         }).catch(function (error) {
                              reject(error);
                         });
                    },100);
                    }
               } catch (err) {
                    console.error(err)
                    reject(err);
               }


          });
}

module.exports.getFilePath = OpenApi.getPath;
module.exports.OpenApi = OpenApi;
module.exports.getClasses = OpenApi.getUniqueClasses;
module.exports.getUMLPackage = OpenApi.getPackage;
module.exports.getPaths = OpenApi.getOperations;
module.exports.getFileType = OpenApi.getType;
module.exports.getError = OpenApi.getError;
module.exports.setError = OpenApi.setError;
module.exports.setAppMode = OpenApi.setAppMode;
module.exports.getAppMode = OpenApi.getAppMode;
module.exports.APP_MODE_GEN = 1;
module.exports.APP_MODE_TEST = 2;
module.exports.setTestMode = OpenApi.setTestMode;
module.exports.getTestMode = OpenApi.getTestMode;
module.exports.TEST_MODE_SINGLE = 1;
module.exports.TEST_MODE_ALL = 2;
module.exports.addSummery = addSummery;
module.exports.getSummery = getSummery;
module.exports.resetSummery = resetSummery;
module.exports.validateSwagger = validateSwagger;
module.exports.getPackagePath = OpenApi.getPackagePath;
module.exports.getParentPkg = OpenApi.getParentPkg;
module.exports.getUMLAssociation = OpenApi.getUMLAssociation;
module.exports.getUMLGeneralization = OpenApi.getUMLGeneralization;
