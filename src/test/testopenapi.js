const Info = require('../info');
const Component = require('../component');
const Utils = require('../utils');
const TestFileGenerator = require('../test/testfilegenerator');
const Paths = require('../paths');
const Servers = require('../servers');
const MainJSON = require('../mainjson');

/**
 *
 *
 * @class TestOpenApi
 */
class TestOpenApi {

     /**
      * Creates an instance of TestOpenApi.
      * 
      * @constructor TestOpenApi
      * @param {UMLPackage} umlPackage
      * @param {string} basePath
      * @param {Object} options
      * @param {integer} fileType
      */
     constructor(umlPackage, basePath, options, fileType) {
          TestOpenApi.umlPackage = umlPackage;
          TestOpenApi.filePath = basePath;
          this.options = options;
          this.schemas = [];
          TestOpenApi.operations = [];
          this.utils = new Utils();
          TestOpenApi.fileType = fileType;
          TestOpenApi.uniqueClassesArr = [];

          TestOpenApi.error = {};
          // TestOpenApi.isDuplicate=false;
          // TestOpenApi.duplicateClasses = [];

     }

     /**
      * @function testUMLPackage
      * @description initializes UML Package
      */
     testUMLPackage() {
          try {
               // fs.mkdirSync(TestOpenApi.filePath);
               if (TestOpenApi.umlPackage instanceof type.UMLPackage) {
                    this.getUMLModels();
               } else {
                    TestOpenApi.umlPackage.ownedElements.forEach(element => {
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
      * @description get all models from UMLPacakage
      */
     getUMLModels() {
          try {
               let _this = this;
               if (TestOpenApi.umlPackage instanceof type.UMLPackage) {
                    if (Array.isArray(TestOpenApi.umlPackage.ownedElements)) {
                         TestOpenApi.umlPackage.ownedElements.forEach(child => {
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
                                   TestOpenApi.operations.push(child);
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
                              TestOpenApi.uniqueClassesArr = uniqueArr;

                              if (!isDuplicate) {
                                   _this.generateTestOpenAPI();
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
      * 
      * @function findClass
      * @description finds the element from the class
      * @param {UMLClass} elem
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
      * @function setError
      * @description save error or warning to be shown to UI
      * @static
      * @memberof TestOpenApi
      */
     static setError(error) {
          TestOpenApi.error = error;
     }

     /**
      * @function getError
      * @description returns error or warning to be shown to UI
      * @static
      * @memberof TestOpenApi
      */
     static getError() {
          return TestOpenApi.error;
     }

     /**
      * @function getUniqueClasses
      * @description save and returns the array of unique classes
      * @static
      * @returns returns array of unique classes
      * @memberof TestOpenApi
      */
     static getUniqueClasses() {
          return TestOpenApi.uniqueClassesArr;
     }

     /**
      * @function getPath
      * @description returns filePath
      * @static
      * @returns returns filePath
      * @memberof TestOpenApi
      */
     static getPath() {
          return TestOpenApi.filePath;
     }

     /**
      * @function getPackage
      * @description returns UMLPackage
      * @static
      * @returns returns UMLPackage
      * @memberof TestOpenApi
      */
     static getPackage() {
          return TestOpenApi.umlPackage;
     }

     /**
      * @function getOperations
      * @description returns path operations
      * @static
      * @returns operations
      * @memberof TestOpenApi
      */
     static getOperations() {
          return TestOpenApi.operations;
     }

     /**
      * @function getType
      * @description returns fileType
      * @static
      * @returns fileType
      * @memberof TestOpenApi
      */
     static getType() {
          return TestOpenApi.fileType;
     }

     /**
      * @function generateTestOpenAPI
      * @description generate open api json
      */
     generateTestOpenAPI() {
          try {
               // Add TestOpenApi component
               let component = new Component();
               MainJSON.addComponent(component);

               // Add TestOpenApi information
               let mInfo = new Info();
               MainJSON.addInfo(mInfo);

               // Add TestOpenApi version
               MainJSON.addApiVersion('3.0.0')

               //Add TestOpenApi paths
               let paths = new Paths();
               MainJSON.addPaths(paths);

               //Add TestOpenApi servers
               let server = new Servers();
               MainJSON.addServers(server);




               if (TestOpenApi.error.hasOwnProperty('isWarning') && TestOpenApi.error.isWarning == true) {
                    app.dialogs.showErrorDialog(TestOpenApi.getError().msg);
                    return;
               }
               let generator = new TestFileGenerator();
               generator.generate();



          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports.getFilePath = TestOpenApi.getPath;
module.exports.TestOpenApi = TestOpenApi;
module.exports.getClasses = TestOpenApi.getUniqueClasses;
module.exports.getUMLPackage = TestOpenApi.getPackage;
module.exports.getPaths = TestOpenApi.getOperations;
module.exports.getFileType = TestOpenApi.getType;
module.exports.getError = TestOpenApi.getError;
module.exports.setError = TestOpenApi.setError;