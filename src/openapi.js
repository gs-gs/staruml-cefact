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
          // OpenApi.isDuplicate=false;
          // OpenApi.duplicateClasses = [];

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

     /**
      * @function getUMLModels
      * @description get and stores UMLInterface, UMLClass & UMLGeneralization 
      * @memberof OpenAPI
      */
     getUMLModels() {
          try {
               let _this = this;
               if (OpenApi.umlPackage instanceof type.UMLPackage) {
                    if (Array.isArray(OpenApi.umlPackage.ownedElements)) {
                         OpenApi.umlPackage.ownedElements.forEach(child => {
                              if (child instanceof type.UMLClass) {
                                   setTimeout(function () {
                                        try {
                                             _this.findClass(child);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error);
                                        }
                                   }, 10);
                              } else if (child instanceof type.UMLInterface) {
                                   OpenApi.operations.push(child);
                              } else if (child instanceof type.UMLGeneralization) {
                                   setTimeout(function () {
                                        _this.findClass(child.target);
                                   }, 5);
                              }
                         });
                    }

                    setTimeout(function () {
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

                              resArr.sort(function (a, b) {
                                   return a.name.localeCompare(b.name);
                              });

                              let uniqueArr = [];
                              let duplicateClasses = [];
                              let isDuplicate = false;
                              resArr.forEach(item => {
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
                              });
                              OpenApi.uniqueClassesArr = uniqueArr;

                              if (!isDuplicate) {
                                   _this.generateOpenAPI();
                              } else {
                                   app.dialogs.showErrorDialog("There " + (duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + duplicateClasses.join() + (duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
                              }
                         } catch (error) {
                              console.error("Found error", error.message);
                              _this.utils.writeErrorToFile(error);
                         }
                    }, 500);
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
               if (umlClass.ownedElements.length > 0) {
                    umlClass.ownedElements.forEach(child => {
                         if (child instanceof type.UMLAssociation) {
                              if (child.end1.reference.name != child.end2.reference.name) {
                                   setTimeout(function () {
                                        try {
                                             _this.findClass(child.end2.reference);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error);
                                        }
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
     generateOpenAPI() {
          try {


               this.resetPackagePath();
               let arrPath = this.findHierarchy(OpenApi.getPackage());
               let rPath = this.reversePkgPath(arrPath);
               OpenApi.setPackagepath(rPath);


               // Add openapi version
               MainJSON.addApiVersion('3.0.0');

               // Add openapi information
               let mInfo = new Info();
               MainJSON.addInfo(mInfo);

               //Add openapi servers
               let server = new Servers();
               MainJSON.addServers(server);

               //Add openapi paths
               let paths = new Paths();
               MainJSON.addPaths(paths);

               // Add openapi component
               let component = new Component();
               MainJSON.addComponent(component);

               let generator = new FileGenerator();
               generator.generate();



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

          parser.validate(pathValidator, (err, api) => {
               if (err) {
                    // Error
                    reject(err);
               } else {
                    // Success
                    resolve({
                         message: "success"
                    })
               }
          });
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