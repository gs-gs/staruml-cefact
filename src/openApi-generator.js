const codegen = require('./codegen-utils');
const info=require('./info');
const comp=require('./component');
const common=require('./common-utils');
const fileGen=require('./filegenerator');
const operat=require('./operations');



/**
 *
 *
 * @class OpenApiGenerator
 */
class OpenApiGenerator {

     /**
      * @constructor defines initialization of schemas, operations, filepath, error filename, options
      */
     constructor() {
          this.schemas = [];
          this.operations = [];
          this.mFilePath = null;
          this.options = null;
          this.mainOpenApiObj={};
          this.utils=new common.Utils();         
     }

     /**
      * @function generateOpenApi
      * @description json,yml or both file on selected path
      * @param {string} fullPath
      * @param {UMLPackage} elem
      * @param {Object} options
      * @param {string} fileType
      */
     generateOpenApi(fullPath, elem, options, fileType) {
          console.log("generate", fullPath);

          try {
               this.mFilePath = fullPath;
               this.options = options;


               let _this = this;
               if (elem instanceof type.UMLPackage) {

                    if (Array.isArray(elem.ownedElements)) {
                         elem.ownedElements.forEach(child => {
                              if (child instanceof type.UMLClass) {
                                   setTimeout(function() {
                                        try {
                                             _this.findClass(child, this.options);
                                        } catch (error) {
                                             console.error("Found error", error.message);
                                             _this.utils.writeErrorToFile(error,this.mFilePath);
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

                              let uniqArr = [];
                              let duplicateClasses = [];

                              let isDuplicate = false;
                              resArr.forEach(item => {
                                   let filter = uniqArr.filter(subItem => {
                                        return item.name == subItem.name;
                                   });
                                   if (filter.length == 0) {
                                        uniqArr.push(item);
                                   } else {
                                        isDuplicate = true;
                                        duplicateClasses.push(item.name);
                                        let firstElem = uniqArr.indexOf(filter[0]);
                                        uniqArr[firstElem].attributes = uniqArr[firstElem].attributes.concat(item.attributes);
                                        uniqArr[firstElem].ownedElements = uniqArr[firstElem].ownedElements.concat(item.ownedElements);
                                   }
                              });

                              if (!isDuplicate) {
                                   _this.writeClass(uniqArr, fullPath, elem, fileType);
                              } else {
                                   app.dialogs.showErrorDialog("There " + (duplicateClasses.length > 1 ? "are" : "is") + " duplicate " + duplicateClasses.join() + (duplicateClasses.length > 1 ? " classes" : " class") + " for same name.");
                              }
                         } catch (error) {
                              console.error("Found error", error.message);
                              _this.utils.writeErrorToFile(error,this.mFilePath);
                         }

                    }, 500);

               }
          } catch (error) {
               console.error("Found error", error.message);
               // expected output: ReferenceError: nonExistentFunction is not defined
               // Note - error messages will vary depending on browser
               this.utils.writeErrorToFile(error,this.mFilePath);
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
                                             _this.utils.writeErrorToFile(error,this.mFilePath);
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
               this.utils.writeErrorToFile(error,this.mFilePath);
          }
     }


     /**
      * @function writeClass
      * @description Write Class (Schema)
      * @param {array} classes
      * @param {string} fullPath for generate yml
      * @param {Object} options
      * @param {UMLPackage} mainElem package element
      */
     writeClass(classes, fullPath, mainElem, fileType) {
          try {

               let classLink = app.repository.select("@UMLAssociationClassLink");

               // Adding openapi component
               let codeWriter;
               codeWriter = new codegen.CodeWriter();
               codeWriter.setIndentString(codeWriter.getIndentString(this.options));
               codeWriter.writeLine('components:');
               let component=new comp.Component(fullPath);
               codeWriter.writeLine('schemas:' + (classes.length == 0 ? " {}" : ""), 1, 0);
               codeWriter.writeLine(null, 1, 0);
               this.mainOpenApiObj.components=component.getComponent(classes,classLink,codeWriter);

               codeWriter.writeLine(null, 0, 2);

               // Adding openapi information
               codeWriter.writeLine("info: {description: " + mainElem.name + " API - 1.0.0, title: " + mainElem.name + " API, version: '1.0.0'}")

               let mInfo=new info.Info(mainElem);
               this.mainOpenApiObj.info=mInfo.getInfo();

               // Adding openapi version
               codeWriter.writeLine("openapi: 3.0.0");
               this.mainOpenApiObj.openapi='3.0.0';

               //Adding openapi operations
               codeWriter.writeLine("paths:" + (this.operations.length == 0 ? " {}" : ""));

               let mOperations=new operat.Operations(this.operations,fullPath);
               this.mainOpenApiObj.paths=mOperations.getOperations(codeWriter);

               codeWriter.writeLine(null, 0, 1);

               //Adding openapi servers
               codeWriter.writeLine("servers: []");
               let mainServerArr=[];
               this.mainOpenApiObj.servers=mainServerArr;

               console.log("Result generated JSON Object : ",this.mainOpenApiObj);
               let generator=new fileGen.FileGenerator();
               generator.generate(codeWriter, fullPath, mainElem, fileType,this.mainOpenApiObj);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,this.mFilePath);
          }

     }


}

exports.OpenApiGenerator = OpenApiGenerator;