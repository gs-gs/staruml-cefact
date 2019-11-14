const fs = require('fs');
const Info = require('./info');
const Component = require('./component');
const Utils = require('./utils');
const FileGenerator = require('./filegenerator');
const Paths = require('./paths');
const Servers = require('./servers');
const MainJSON = require('./mainjson');
const constant = require('../src/constant');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
var forEach = require('async-foreach').forEach;
const openAPI = require('./openapi');
const diagramEle = require('./diagram/diagramElement');
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
          OpenApi.pkgPath = [];
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
          return new Promise((resolve, reject) => {
               try {
                    try {
                         if (!fs.existsSync(OpenApi.filePath)) {
                              fs.mkdirSync(OpenApi.filePath);
                              resolve({
                                   result: "success",
                                   message: "Package initialize successfully"
                              })
                         } else {
                              resolve({
                                   result: "success",
                                   message: "Package initialize successfully"
                              })
                         }
                    } catch (err) {
                         console.error(err)
                         reject(err);
                    }

               } catch (_e) {
                    console.error(_e);
                    reject(_e);
                    app.toast.error(constant.strerrorgenfail);
               }
          });

     }

     getModelElements() {

          return new Promise(async (resolve, reject) => {
               let umlPackage = OpenApi.getPackage();
               var _pkgName = umlPackage.name
               let umlClasses = [];
               OpenApi.operations = [];
               let assocCurrentPkg = []
               let generaCurrentPkg = [];

               if (openAPI.isModelPackage()) {
                    /* ------------ 1. UMLClass ------------ */
                    umlClasses = app.repository.select(_pkgName + "::@UMLClass");

                    /* ------------ 2. UMLInterface ------------ */
                    OpenApi.operations = app.repository.select(_pkgName + "::@UMLInterface");

                    /* ------------ 3. Association Class------------ */
                    assocCurrentPkg = await OpenApi.getUMLAssociation();

                    /* ------------ 4. Generalization Class ------------ */
                    generaCurrentPkg = await OpenApi.getUMLGeneralization();

               } else if (openAPI.isModelDiagram()) {

                    umlClasses = diagramEle.getUMLClass();

                    OpenApi.operations = diagramEle.getUMLInterface();

                    assocCurrentPkg = diagramEle.getUMLAssociation();

                    generaCurrentPkg = diagramEle.getUMLGeneralization();
               }

               let tmpAsso = [];
               forEach(assocCurrentPkg, (child, index) => {
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

               let tmpGen = [];
               forEach(generaCurrentPkg, (child, index) => {
                    let filter = umlClasses.filter(subItem => {
                         return child.target.name == subItem.name;
                    });
                    if (filter.length == 0) {
                         umlClasses.push(child.target);
                         tmpGen.push(child.target.name);
                    }
               });

               /* ------------ 5. Find and sort classes ------------ */
               let resArr = OpenApi.findAndSort(umlClasses);

               /* ------------ 5. Check for duplicate classes ------------ */
               try {
                    let resultDup = OpenApi.checkForDuplicate(resArr);
                    resolve(resultDup);
               } catch (error) {
                    reject(error);
               }



          });
     }
     static checkForDuplicate(resArr) {
          let uniqueArr = [];
          let duplicateClasses = [];
          let isDuplicate = false;


          forEach(resArr, function (item, index) {
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

          });


          if (!isDuplicate) {

               let mClasses = [];
               forEach(OpenApi.uniqueClassesArr, element => {
                    mClasses.push(element.name);
               });

               let mPaths = [];
               forEach(OpenApi.operations, element => {
                    mPaths.push(element.name);
               });
               console.log("Duplication filter done");
               console.log("Query Total Classes", mClasses);
               console.log("Query Total Interfaces", mPaths);
               return {
                    result: constant.FIELD_SUCCESS,
                    message: "model element generated"
               };
          } else {
               let message = null;
               if (duplicateClasses.length > 1) {
                    message = "There are duplicate \'" + duplicateClasses.join("\', \'") + "\'" + " classes for same name.";
               } else {
                    message = "There is duplicate \'" + duplicateClasses.join("\', \'") + "\'" + " class for same name.";
               }

               if (openAPI.getAppMode() == openAPI.APP_MODE_TEST && openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {
                    let jsonError = {
                         isDuplicate: true,
                         msg: message
                    };
                    openAPI.setError(jsonError);
               }

               throw new Error(message);

          }
     }
     static findAndSort(umlClasses) {
          /* ------------ 4. Filter unique classes ------------ */
          let resArr = [];
          forEach(umlClasses, (item, index) => {
               let filter = resArr.filter(subItem => {
                    return subItem._id == item._id;
               });
               if (filter.length == 0) {
                    resArr.push(item);
               }

          });
          console.log("Filter class done");

          /* ------------ 5. Sort unique classes ------------ */
          resArr.sort(function (a, b) {
               return a.name.localeCompare(b.name);
          });
          console.log("Sort class done");
          return resArr;
     }
     /**
      * @function setModelType
      * @description set model type like user want to generate specs from UMLClassDiagram (IS_APP_DIAGRAM) or UMLPackage (IS_APP_PACKAGE)
      * @static
      * @memberof OpenApi
      */
     static setModelType(modelType) {
          OpenApi.modelType = modelType;
     }

     /**
      * @function getModelType
      * @description get model type like UMLClassDiagram (IS_APP_DIAGRAM) or UMLPackage (IS_APP_PACKAGE)
      * @static
      * @memberof OpenApi
      */
     static getModelType() {
          return OpenApi.modelType;
     }

     static isModelPackage(){
          if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {
               return true;
          }
          return false;
     }

     static isModelDiagram(){
          if (openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM) {
               return true;
          }
          return false;
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
          OpenApi.pkgPath = [];
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
     /**
      * @function getUMLAssociation
      * @description Returns the promise of class wise Association
      * @static
      * @returns
      * @memberof OpenApi
      */
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
                    reject(error);
               }

          });
     }
     /**
      * @function getUMLGeneralization
      * @description returns the promise of class wise generalization
      * @static
      * @returns
      * @memberof OpenApi
      */
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
      * @function getparentPkg
      * @description Finds the parent package of element from UMLModel
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
     static findHierarchy(umlPackage) {
          OpenApi.pkgPath.push(umlPackage.name);
          if (umlPackage.hasOwnProperty('_parent') && umlPackage._parent != null && umlPackage._parent instanceof type.UMLPackage) {

               this.findHierarchy(umlPackage._parent);
          }
          return OpenApi.pkgPath;
     }
     /**
      * @function reversePkgPath
      * @description returns the package path recursively
      * @returns {string}
      * @memberof OpenApi
      */
     static reversePkgPath() {
          let str = '';
          for (let i = (OpenApi.pkgPath.length - 1); i >= 0; i--) {
               str += OpenApi.pkgPath[i] + '\\';
          }
          return str;
     }

     /**
      * @function generateOpenAPI
      * @description generate open api json object
      * @memberof OpenApi
      */
     generateOpenAPI() {
          return new Promise((resolve, reject) => {
               try {

                    /* let _this = this;
                    this.resetPackagePath();
                    let arrPath = OpenApi.findHierarchy(OpenApi.getPackage());
                    let rPath = OpenApi.reversePkgPath(arrPath);
                    OpenApi.setPackagepath(rPath); */

                    this.resetPackagePath();

                    let arrPath = [];
                    let rPath = '';

                    if (openAPI.isModelPackage()) {

                         arrPath = OpenApi.findHierarchy(OpenApi.getPackage());
                         rPath = OpenApi.reversePkgPath(arrPath);

                    } else if (openAPI.isModelDiagram()) {

                         let srcRes = app.repository.search(openAPI.getUMLPackage().name);
                         let fRes = srcRes.filter(function (item) {
                              return (item instanceof type.UMLClassDiagram && item.name == openAPI.getUMLPackage().name);
                         });
                         if (fRes.length == 1) {
                              arrPath = openAPI.findHierarchy(fRes[0]._parent);
                              rPath = openAPI.reversePkgPath(arrPath);
                         }
                    }
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
                    console.log("-----component-generated-----");
                    console.log(MainJSON.getJSON());
                    let generator = new FileGenerator();
                    generator.generate().then(function (fileGenerate) {
                         console.log("-----file-generated-----");
                         console.log("result-file-generated", fileGenerate);
                         generator.validateAndPrompt().then(function (result) {
                              console.log("-----validate & prompt-----");
                              console.log("result-validate & prompt", result);
                              resolve(result);
                         }).catch(function (err) {
                              reject(err);
                         });

                    }).catch(function (err) {
                         reject(err);
                    });

               } catch (error) {

                    console.error("generateOpenAPI", error);
                    this.utils.writeErrorToFile(error);
                    reject(error);
               }
          });
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
               /*  console.log("Filepath :", pathValidator); */
               if (fs.existsSync(pathValidator)) {
                    console.log("File exist");
                    parser.validate(pathValidator, (err, api) => {
                         if (err) {
                              /* Error */
                              reject(err);
                         } else {
                              /* Success */
                              resolve({
                                   result: constant.FIELD_SUCCESS,
                                   message: "success"
                              })
                         }
                    }).catch(function (error) {
                         reject(error);
                    });
               }
          } catch (err) {
               console.error("--mayur", err)
               reject(err);
          }


     });
}
/**
 * @function findPackageWiseUMLAssociation
 * @description finds package wise UMLAssociation hierarchy recursively
 * @param {UMLPackage} umlPackage
 * @returns {Array}
 * @memberof OpenApi
 */
let filteredAssociation = [];

function getPackageWiseUMLAssociation() {
     // new Promise((resolve, reject) => {

     let _this = this;
     let associations = app.repository.select("@UMLAssociation");
     filteredAssociation = [];
     forEach(associations, (item) => {
          // var clonedElement = Object.assign(item, item);
          // var clonedItem = Object.assign(item, item);

          // var copyObject=copy(item);
          findParentPackage(item, item);
          // let mItem = findParentPackage(item,item);
          /* console.log("mItem", mItem);
          if(mItem!=null){
               filteredAssociation.push(mPkg);
          } */

     });
     // resolve(filteredAssociation);
     return filteredAssociation;
     // });
}

function copy(mainObj) {
     let objCopy = {}; // objCopy will store a copy of the mainObj
     let key;

     for (key in mainObj) {
          objCopy[key] = mainObj[key]; // copies each property to the objCopy object
     }
     return objCopy;
}

function findParentPackage(ele, item) {
     // return new Promise((resolve, reject) => {

     if (ele instanceof type.UMLPackage) {
          if (ele != null && ele.name == 'Movements' /* openAPI.getUMLPackage().name */ ) {
               // console.log("ele",ele);
               // console.log("item",item);
               filteredAssociation.push(item);
               // return item;
          }

          // resolve(assocItem);
     } else if (ele.hasOwnProperty('_parent') && ele._parent != null) {
          findParentPackage(ele._parent, item);
     }
     // return null;
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
module.exports.APP_MODEL_PACKAGE = 0;
module.exports.APP_MODEL_DIAGRAM = 1;
module.exports.APP_MODE_TEST = 2;
module.exports.setModelType = OpenApi.setModelType;
module.exports.getModelType = OpenApi.getModelType;
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
module.exports.findHierarchy = OpenApi.findHierarchy;
module.exports.reversePkgPath = OpenApi.reversePkgPath;
module.exports.getPackageWiseUMLAssociation = getPackageWiseUMLAssociation;
module.exports.setPackagepath = OpenApi.setPackagepath;
module.exports.isModelPackage = OpenApi.isModelPackage;
module.exports.isModelDiagram = OpenApi.isModelDiagram;