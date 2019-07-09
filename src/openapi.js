const fs = require('fs');
const Info=require('./info');
const Component=require('./component');
const Utils=require('./utils');
const FileGenerator=require('./filegenerator');
const Paths=require('./paths');
const Servers=require('./servers');

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
      */
     constructor(umlPackage, basePath, options,fileType) {
          OpenApi.umlPackage = umlPackage;
          OpenApi.filePath=basePath;
          this.options = options;
          this.schemas = [];
          OpenApi.operations = [];
          this.mainOpenApiObj={};
          this.utils=new Utils();   
          OpenApi.fileType=fileType;
          OpenApi.uniqueClassesArr=[];
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
      * @function generateOpenApi
      * @description json,yml or both file on selected path
      * @param {UMLPackage} elem
      * @param {Object} options
      * @param {string} fileType
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
                                             _this.findClass(child, _this.options);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error);
                                        }
                                   }, 10);
                                   //  _this.schemas.push(child);
                              } else if (child instanceof type.UMLInterface) {

                                   OpenApi.operations.push(child);
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
                         }
                    });
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }

     static getUniqueClasses(){
          return OpenApi.uniqueClassesArr;
     }

     static getPath(){
          return OpenApi.filePath;
     }

     static getPackage(){
          return OpenApi.umlPackage;
     }

     static getOperations(){
          return OpenApi.operations;
     }

     static getType(){
          return OpenApi.fileType;
     }
     /**
      * @function generateOpenAPI
      * @description Write Class (Schema)
      * @param {array} classes
      */
     generateOpenAPI() {
          try {
               // Adding openapi component
               let component=new Component();
               this.addComponent(component);


               // Adding openapi information
               let mInfo=new Info();
               this.addInfo(mInfo);


               // Adding openapi version
               this.mainOpenApiObj.openapi='3.0.0';


               //Adding openapi paths
               let paths=new Paths();
               this.addPaths(paths);


               //Adding openapi servers
               let server=new Servers();
               this.addServers(server);

               console.log("Result generated JSON Object : ",this.mainOpenApiObj);
               let generator=new FileGenerator();
               generator.generate(this.mainOpenApiObj);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }

     }

     addComponent(component)
     {
          this.mainOpenApiObj.components=component.getComponent();
     }

     addInfo(mInfo){
          this.mainOpenApiObj.info=mInfo.getInfo();
     }

     addPaths(mPaths){
          this.mainOpenApiObj.paths=mPaths.getOperations();
     }

     addServers(servers){
          this.mainOpenApiObj.servers=servers.getServers();
     }

}

module.exports.getFilePath=OpenApi.getPath;
module.exports.OpenApi=OpenApi;
module.exports.getClasses=OpenApi.getUniqueClasses;
module.exports.getUMLPackage=OpenApi.getPackage;
module.exports.getPaths=OpenApi.getOperations;
module.exports.getFileType=OpenApi.getType;