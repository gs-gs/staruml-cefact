const fs = require('fs');
const Info=require('./info');
const Component=require('./component');
const Utils=require('./utils');
const FileGenerator=require('./filegenerator');
const Paths=require('./paths');
const Servers=require('./servers');
const MainJSON=require('./mainjson');

/**
 *
 *
 * @class OpenApi
 */
class OpenApi {

     /**
      * Creates an instance of OpenApi.
      * 
      * @constructor OpenApi
      * @param {UMLPackage} umlPackage
      * @param {string} basePath
      * @param {Object} options
      * @param {integer} fileType
      */
     constructor(umlPackage, basePath, options,fileType) {
          OpenApi.umlPackage = umlPackage;
          OpenApi.filePath=basePath;
          this.options = options;
          this.schemas = [];
          OpenApi.operations = [];
          this.utils=new Utils();   
          OpenApi.fileType=fileType;
          OpenApi.uniqueClassesArr=[];
          OpenApi.error={};
          // OpenApi.isDuplicate=false;
          // OpenApi.duplicateClasses = [];
     }

     

     /**
      * Generates file as user have selected fileType (JSON, YML, BOTH)
      *
      * @function generate
      */
     initUMLPackage() {
          try {
               fs.mkdirSync(OpenApi.filePath);
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
      * @description get all models from UMLPacakage
      */
     getUMLModels() {
          
          try {
               let _this = this;
               if (OpenApi.umlPackage instanceof type.UMLPackage) {

                    if (Array.isArray(OpenApi.umlPackage.ownedElements)) {
                         OpenApi.umlPackage.ownedElements.forEach(child => {
                              if (child instanceof type.UMLClass) {
                                   setTimeout(function() {
                                        try {
                                             _this.findClass(child);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error);
                                        }
                                   }, 10);
                                   //  _this.schemas.push(child);
                              } else if (child instanceof type.UMLInterface) {

                                   OpenApi.operations.push(child);
                              } else if (child instanceof type.UMLGeneralization) {
                                   setTimeout(function () { _this.findClass(child.target); }, 5);
                              }

                         });
                    }

                    setTimeout(function() {
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

                              resArr.sort(function(a, b) {
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
               // expected output: ReferenceError: nonExistentFunction is not defined
               // Note - error messages will vary depending on browser
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
                                   setTimeout(function() {
                                        try {
                                             _this.findClass(child.end2.reference);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error);
                                        }
                                   }, 5);
                              }
                         } else if (child instanceof type.UMLClass) {
                              setTimeout(function() {
                                   _this.findClass(child);
                              }, 5);
                         } else if (child instanceof type.UMLGeneralization) {
                              setTimeout(function () { _this.findClass(child.target); }, 5);
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
      * @memberof OpenApi
      */
     static setError(error){
          OpenApi.error=error;
     }

     /**
      * @function getError
      * @description returns error or warning to be shown to UI
      * @static
      * @memberof OpenApi
      */
     static getError(){
          return OpenApi.error;
     }

     /**
      * @function getUniqueClasses
      * @description save and returns the array of unique classes
      * @static
      * @returns returns array of unique classes
      * @memberof OpenApi
      */
     static getUniqueClasses(){
          return OpenApi.uniqueClassesArr;
     }

     /**
      * @function getPath
      * @description returns filePath
      * @static
      * @returns returns filePath
      * @memberof OpenApi
      */
     static getPath(){
          return OpenApi.filePath;
     }

     /**
      * @function getPackage
      * @description returns UMLPackage
      * @static
      * @returns returns UMLPackage
      * @memberof OpenApi
      */
     static getPackage(){
          return OpenApi.umlPackage;
     }

     /**
      * @function getOperations
      * @description returns path operations
      * @static
      * @returns operations
      * @memberof OpenApi
      */
     static getOperations(){
          return OpenApi.operations;
     }

     /**
      * @function getType
      * @description returns fileType
      * @static
      * @returns fileType
      * @memberof OpenApi
      */
     static getType(){
          return OpenApi.fileType;
     }
     
     /**
      * @function generateOpenAPI
      * @description generate open api json
      */
     generateOpenAPI() {
          try {
               // if (OpenApi.isDuplicate) {
                    // Add openapi component
                    let component = new Component();
                    MainJSON.addComponent(component);


                    // Add openapi information
                    let mInfo = new Info();
                    MainJSON.addInfo(mInfo);


                    // Add openapi version
                    MainJSON.addApiVersion('3.0.0')


                    //Add openapi paths
                    let paths = new Paths();
                    MainJSON.addPaths(paths);


                    //Add openapi servers
                    let server = new Servers();
                    MainJSON.addServers(server);

                    // console.log("Result generated JSON Object : ", MainJSON.getJSON());
                    if(OpenApi.error.hasOwnProperty('isWarning') && OpenApi.error.isWarning==true){
                         app.dialogs.showErrorDialog(OpenApi.getError().msg);
                         return;
                    }
                    let generator = new FileGenerator();
                    generator.generate();
               // } else {
               //      app.dialogs.showErrorDialog("There " + (OpenApi.duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + OpenApi.duplicateClasses.join() + (OpenApi.duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
               // }

          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }

     }

     

     

}

module.exports.getFilePath=OpenApi.getPath;
module.exports.OpenApi=OpenApi;
module.exports.getClasses=OpenApi.getUniqueClasses;
module.exports.getUMLPackage=OpenApi.getPackage;
module.exports.getPaths=OpenApi.getOperations;
module.exports.getFileType=OpenApi.getType;
module.exports.getError=OpenApi.getError;
module.exports.setError=OpenApi.setError;