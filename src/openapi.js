const fs = require('fs')
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
          this.umlPackage = umlPackage;
          this.filePath = basePath;
          this.options = options;
          this.schemas = [];
          this.operations = [];
          this.mainOpenApiObj={};
          this.utils=new Utils();   
          this.fileType=fileType;
          this.uniqueClassesArr=[];
     }

     

     /**
      * Generates file as user have selected fileType (JSON, YML, BOTH)
      *
      * @function generate
      */
     initUMLPackage() {
          try {
               fs.mkdirSync(this.filePath);
               if (this.umlPackage instanceof type.UMLPackage) {
                    this.getUMLModels();
               } else {
                    this.umlPackage.ownedElements.forEach(element => {
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
               if (_this.umlPackage instanceof type.UMLPackage) {

                    if (Array.isArray(_this.umlPackage.ownedElements)) {
                         _this.umlPackage.ownedElements.forEach(child => {
                              if (child instanceof type.UMLClass) {
                                   setTimeout(function() {
                                        try {
                                             _this.findClass(child, _this.options);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error,_this.filePath);
                                        }
                                   }, 10);
                                   //  _this.schemas.push(child);
                              } else if (child instanceof type.UMLInterface) {

                                   _this.operations.push(child);
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
                              _this.uniqueClassesArr = uniqueArr;


                              if (!isDuplicate) {
                                   _this.generateOpenAPI();
                              } else {
                                   app.dialogs.showErrorDialog("There " + (duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + duplicateClasses.join() + (duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
                              }
                         } catch (error) {
                              console.error("Found error", error.message);
                              _this.utils.writeErrorToFile(error,this.filePath);
                         }

                    }, 500);

               }
          } catch (error) {
               console.error("Found error", error.message);
               // expected output: ReferenceError: nonExistentFunction is not defined
               // Note - error messages will vary depending on browser
               this.utils.writeErrorToFile(error,this.filePath);
          }
     }


     /**
      * 
      * @function findClass
      * @description finds the element from the class
      * @param {UMLClass} elem
      */
     findClass(elem) {
          try {
               let _this = this;
               _this.schemas.push(elem);
               if (elem.ownedElements.length > 0) {
                    elem.ownedElements.forEach(child => {
                         if (child instanceof type.UMLAssociation) {
                              if (child.end1.reference.name != child.end2.reference.name) {
                                   setTimeout(function() {
                                        try {
                                             _this.findClass(child.end2.reference, _this.options);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error,this.filePath);
                                        }
                                   }, 5);
                              }
                         } else if (child instanceof type.UMLClass) {
                              setTimeout(function() {
                                   _this.findClass(child, _this.options);
                              }, 5);
                         }
                    });
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,this.filePath);
          }
     }

     static getUniqueClasses(){
          return this.uniqueClassesArr;
     }

     static getFilePath(){
          return this.filePath;
     }

     static getName(){
          return "this is name";
     }
     /**
      * @function generateOpenAPI
      * @description Write Class (Schema)
      * @param {array} classes
      */
     generateOpenAPI() {
          try {
               // Adding openapi component
               let component=new Component(this.uniqueClassesArr,this.filePath);
               this.addComponent(component);


               // Adding openapi information
               let mInfo=new Info(this.umlPackage);
               this.addInfo(mInfo);

               // Adding openapi version
               this.mainOpenApiObj.openapi='3.0.0';

               //Adding openapi paths
               let paths=new Paths(this.operations,this.filePath);
               this.addPaths(paths);


               //Adding openapi servers
               let server=new Servers();
               this.addServers(server);

               console.log("Result generated JSON Object : ",this.mainOpenApiObj);
               let generator=new FileGenerator();
               generator.generate(this.filePath, this.umlPackage, this.fileType,this.mainOpenApiObj);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,this.filePath);
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
module.exports=OpenApi;