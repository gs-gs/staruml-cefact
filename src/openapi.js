const nodeUtils = require('util');
const fs = require('fs');
const notAvailElement = require('./notavailelement');
const Info = require('./info');
const Component = require('./component');
const utils = require('./utils');
const FileGenerator = require('./filegenerator');
const Paths = require('./paths');
const Servers = require('./servers');
const MainJSON = require('./mainjson');
const constant = require('../src/constant');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
var forEach = require('async-foreach').forEach;
const openAPI = require('./openapi');
const dElement = require('./diagram/dElement');
/* var filterAsync = require('node-filter-async'); */
/**
 * @class OpenApi 
 * @description class returns the OpenAPI
 */
class OpenApi {

     /**
      * @constructor Creates an instance of OpenApi.
      * @param {*} exportElement
      * @param {string} basePath
      * @param {Object} options
      * @param {integer} fileType
      * @memberof OpenAPI
      */
     constructor(exportElement, basePath, options, fileType) {
          OpenApi.exportElement = exportElement;
          OpenApi.filePath = basePath;
          this.options = options;
          this.schemas = [];
          OpenApi.pkgPath = [];
          OpenApi.operations = [];
          utils.resetErrorBlock();
          OpenApi.fileType = fileType;
          OpenApi.uniqueClassesArr = [];
          OpenApi.strPackagePath = '';
          OpenApi.error = {};
     }


     /**
      * @function initUMLPackage
      * @description initializes UML Package
      * @memberof OpenAPI
      */
     initUMLPackage() {
          return new Promise((resolve, reject) => {
               let strType = '';
               if (openAPI.getExportElement() instanceof type.UMLClassDiagram) {
                    strType = 'Diagram';
               } else if (openAPI.getExportElement() instanceof type.UMLPackage) {
                    strType = 'Package';
               }
               try {
                    try {
                         if (!fs.existsSync(OpenApi.filePath)) {
                              fs.mkdirSync(OpenApi.filePath);
                              resolve({
                                   result: "success",
                                   message: strType + " initialize successfully"
                              })
                         } else {
                              resolve({
                                   result: "success",
                                   message: strType + " initialize successfully"
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

     /**
      * @function getModelElements
      * @description returns all model element from Package or Diagram
      * @returns {Promise}
      * @memberof OpenApi
      */
     getModelElements() {

          return new Promise(async (resolve, reject) => {
               let exportElement = OpenApi.getExportElement();
               var _pkgName = exportElement.name
               let umlClasses = [];
               OpenApi.operations = [];
               let assocCurrentPkg = []
               let generaCurrentPkg = [];

               if (openAPI.isModelPackage()) {
                    /* ------------ 1. UMLClass from Package ------------ */
                    umlClasses = app.repository.select(_pkgName + "::@UMLClass");

                    /* ------------ 2. UMLInterface from Package ------------ */
                    OpenApi.operations = app.repository.select(_pkgName + "::@UMLInterface");

                    /* ------------ 3. Association Class from Package ------------ */
                    assocCurrentPkg = await OpenApi.getUMLAssociation();

                    /* ------------ 4. Generalization Class from Package ------------ */
                    generaCurrentPkg = await OpenApi.getUMLGeneralization();

               } else if (openAPI.isModelDiagram()) {
                    /* ------------ 1. UMLClass from Diagram ------------ */

                    /* Adds classes */
                    umlClasses = [];
                    let classesView = dElement.getUMLClassView();
                    forEach(classesView, function (mView) {
                         umlClasses.push(mView.model);
                    });

                    /* ------------ 2. UMLInterface from Diagram ------------ */

                    /* Adds interfaces */
                    OpenApi.operations = [];
                    let umlInterfaceView = dElement.getUMLInterfaceView();
                    forEach(umlInterfaceView, function (mView) {
                         OpenApi.operations.push(mView.model);
                    });

                    /* ------------ 3. Association Class from Diagram ------------ */

                    let assocCurrentPkg = [];
                    let umlAssocView = dElement.getUMLAssociationView();
                    forEach(umlAssocView, function (mView) {
                         assocCurrentPkg.push(mView.model);
                    });

                    /* ------------ 4. Generalization Class from Diagram ------------ */

                    let generaCurrentPkg = [];
                    let umlGeneraView = dElement.getUMLGeneralizationView();
                    forEach(umlGeneraView, function (mView) {
                         generaCurrentPkg.push(mView.model);
                    });

               }

               /*  Add identical target class of association  */
               forEach(assocCurrentPkg, (association) => {
                    if (association.end1.reference.name != association.end2.reference.name) {

                         let filter = umlClasses.filter(mClass => {
                              return association.end2.reference.name == mClass.name;
                         });

                         if (filter.length == 0) {
                              umlClasses.push(association.end2.reference);
                         }
                    }
               });

               /*  Add identical target class of generalizatin  */
               forEach(generaCurrentPkg, (generalization) => {
                    let filter = umlClasses.filter(mClass => {
                         return generalization.target.name == mClass.name;
                    });
                    if (filter.length == 0) {
                         umlClasses.push(generalization.target);
                    }
               });

               /* ------------ 5. Find and sort classes ------------ */
               let resArr = OpenApi.findAndSort(umlClasses);

               /* ------------ 6. Find and sort interfaces ------------ */
               OpenApi.operations = OpenApi.findAndSort(OpenApi.operations);

               /* ------------ 7. Check for duplicate classes ------------ */
               try {
                    let resultDup = OpenApi.checkForDuplicate(resArr);
                    resolve(resultDup);
               } catch (error) {
                    reject(error);
               }



          });
     }

     /**
      * @function checkForDuplicate
      * @description check duplicate elements and returns error 
      * @static
      * @param {*} resArr
      * @returns {result}
      * @memberof OpenApi
      */
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
               return {
                    result: constant.FIELD_SUCCESS,
                    message: constant.STR_MODEL_GENERATED
               };
          } else {
               let message = null;
               if (duplicateClasses.length > 1) {
                    message=nodeUtils.format(constant.STR_DUPLICATE_CLASSES,duplicateClasses.join("\', \'"),'classes');
               } else {
                    message=nodeUtils.format(constant.STR_DUPLICATE_CLASSES,duplicateClasses.join("\', \'"),'class');
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

     /**
      * @function findAndSort
      * @description sort element and returns array
      * @static
      * @param {*} umlClasses
      * @returns {Array}
      * @memberof OpenApi
      */
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

     /**
      * @function isModelPackage
      * @description check and retuns that user have selected Package to generate OpenApi Specification
      * @static
      * @returns {Boolean} 
      * @memberof OpenApi
      */
     static isModelPackage() {
          if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {
               return true;
          }
          return false;
     }

     /**
      * @function isModelDiagram
      * @description check and retuns that user have selected Diagram to generate OpenApi Specification
      * @static
      * @returns {Boolean} 
      * @memberof OpenApi
      */
     static isModelDiagram() {
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
      * @function getExportElement
      * @description returns getExportElement
      * @static
      * @returns {getExportElement}
      * @memberof OpenApi
      */
     static getExportElement() {
          return OpenApi.exportElement;
     }

     static getExportElementName() {
          return OpenApi.umlPackageName;
     }
     static setExportElementName(pkgName) {
          OpenApi.umlPackageName = pkgName;
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
      * @function getFileType
      * @description returns fileType
      * @static
      * @returns {integer}
      * @memberof OpenApi
      */
     static getFileType() {
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
      * @returns {Promise}
      * @memberof OpenApi
      */
     static async getUMLAssociation() {
          return new Promise((resolve, reject) => {

               let tmpAssociation = [];
               try {
                    let umlClasses = app.repository.select(OpenApi.getExportElementName() + "::@UMLClass");
                    forEach(umlClasses, async (objClass, index) => {
                         let umlAssociation = app.repository.select(OpenApi.getExportElementName() + "::" + objClass.name + "::@UMLAssociation");
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
                    utils.writeErrorToFile(error);
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
                    let umlClasses = app.repository.select(OpenApi.getExportElementName() + "::@UMLClass");
                    forEach(umlClasses, async (objClass, index) => {
                         let umlGenera = app.repository.select(OpenApi.getExportElementName() + "::" + objClass.name + "::@UMLGeneralization");
                         if (umlGenera.length > 0) {
                              umlGenera.forEach(function (element) {
                                   tmpGeneralization.push(element);
                              });
                         }
                    });


                    resolve(tmpGeneralization);
               } catch (error) {
                    console.error("Found error", error.message);
                    utils.writeErrorToFile(error);
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
     static findHierarchy(exportElement) {
          OpenApi.pkgPath.push(exportElement.name);
          if (exportElement.hasOwnProperty('_parent') && exportElement._parent != null && exportElement._parent instanceof type.UMLPackage) {

               this.findHierarchy(exportElement._parent);
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

                    this.resetPackagePath();

                    let arrPath = [];
                    let rPath = '';

                    if (openAPI.isModelPackage()) {

                         arrPath = OpenApi.findHierarchy(OpenApi.getExportElement());
                         rPath = OpenApi.reversePkgPath(arrPath);

                    } else if (openAPI.isModelDiagram()) {

                         let srcRes = app.repository.search(openAPI.getExportElementName());
                         let fRes = srcRes.filter(function (item) {
                              return (item instanceof type.UMLClassDiagram && item.name == openAPI.getExportElementName());
                         });
                         if (fRes.length == 1) {
                              arrPath = openAPI.findHierarchy(fRes[0]._parent);
                              rPath = openAPI.reversePkgPath(arrPath);
                         }
                    }
                    OpenApi.setPackagepath(rPath);

                    if (OpenApi.getFileType() == constant.FILE_TYPE_JSON_SCHEMA) {

                         /* Generate JSON-Schema Specification */
                         let component = new Component();

                         /* Resetting for not available class or enum for Qualified attribute type */
                         notAvailElement.resetNotAvailableClassOrEnumeInFile();

                         /* Add JSONSchema object in JSONSchema */                         
                         MainJSON.addJSONSchema(component);

                         /* Add JSONLayout object in JSONSchema */
                         MainJSON.addJSONLayout(component);

                         /* Generate file after JSONSchema generated */
                         let generator = new FileGenerator();
                         generator.generate().then(function (fileGenerate) {
                              notAvailElement.showDialogNotAvailableAttribute();
                              resolve(fileGenerate);
                         }).catch(function (err) {
                              reject(err);
                         });


                    } else {
                         /* Resetting for not available class or enum for Qualified attribute type */
                         notAvailElement.resetNotAvailableClassOrEnumeInFile();
                         // Generate OpenAPI Specification

                         /*  Add openapi version */
                         MainJSON.addApiVersion('3.0.0');

                         /* Add openapi information */
                         let mInfo = new Info();
                         MainJSON.addInfo(mInfo);

                         /* Add openapi servers */
                         let server = new Servers();
                         MainJSON.addServers(server);

                         /* Add openapi paths */
                         let paths = new Paths();
                         MainJSON.addPaths(paths);

                         /* Add openapi component */
                         let component = new Component();
                         MainJSON.addComponent(component);

                         /* Generate file after OpenAPI specs generated */
                         let generator = new FileGenerator();
                         generator.generate().then(function (fileGenerate) {
                              notAvailElement.showDialogNotAvailableAttribute();

                              /* Validate OpenAPI generated json and alert success or failure according  */
                              generator.validateAndPrompt().then(function (result) {
                                   resolve(result);
                              }).catch(function (err) {
                                   reject(err);
                              });

                         }).catch(function (err) {
                              reject(err);
                         });

                    }
               } catch (error) {

                    console.error("generateOpenAPI", error);
                    utils.writeErrorToFile(error);
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
/**
 * @function getPackageWiseUMLAssociation
 * @description returns the all association package wise
 * @returns {Array}
 */
function getPackageWiseUMLAssociation() {

     let associations = app.repository.select("@UMLAssociation");
     filteredAssociation = [];
     forEach(associations, (item) => {
          findParentPackage(item, item);
     });
     return filteredAssociation;
}

/**
 * @function findParentPackage
 * @description returns the list of parent package
 * @param {*} ele
 * @param {*} item
 */
function findParentPackage(ele, item) {
     // return new Promise((resolve, reject) => {

     if (ele instanceof type.UMLPackage) {
          if (ele != null && ele.name == openAPI.getExportElementName()) {
               filteredAssociation.push(item);
          }

     } else if (ele.hasOwnProperty('_parent') && ele._parent != null) {
          findParentPackage(ele._parent, item);
     }
     // return null;
}
module.exports.getFilePath = OpenApi.getPath;
module.exports.OpenApi = OpenApi;
module.exports.getClasses = OpenApi.getUniqueClasses;
module.exports.getExportElement = OpenApi.getExportElement;
module.exports.getPaths = OpenApi.getOperations;
module.exports.getFileType = OpenApi.getFileType;
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
module.exports.getExportElementName = OpenApi.getExportElementName;
module.exports.setExportElementName = OpenApi.setExportElementName;