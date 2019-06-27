const fs = require('fs');
const path = require('path');
const codegen = require('./codegen-utils');
const yaml = require('js-yaml');

/**
 *
 *
 * @class OpenApiGenerator
 */
class OpenApiGenerator {

     /**
      * @constructor defines initialization of schemas, operations, filepath, error filename, errorcontent, options
      */
     constructor() {
          this.schemas = [];
          this.operations = [];
          this.mFilePath = null;
          this.mFileName = '/error.txt';
          this.errorContent = [];
          this.options = null;
     }





     /**
      * @function getType
      * @description Returns type of attribute in string, Get attribute type number,boolean,string 
      * @returns string 
      * @param {string} starUMLType 
      */
     getType(starUMLType) {
          if (starUMLType === "Numeric") {
               return "number";
          } else if (starUMLType === "Indicator") {
               return "boolean";
          } else return "string";
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
                                             _this.writeErrorToFile(error);
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
                              _this.writeErrorToFile(error);
                         }

                    }, 500);

               }
          } catch (error) {
               console.error("Found error", error.message);
               // expected output: ReferenceError: nonExistentFunction is not defined
               // Note - error messages will vary depending on browser
               this.writeErrorToFile(error);
          }
     }


     /**
      * 
      * @function findClass
      * @description finds the element from the class
      * @param {UMLPackage} elem
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
                                             _this.writeErrorToFile(error);
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
               this.writeErrorToFile(error);
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
               // let basePath = path.join(fullPath, mainElem.name + '.json');

               let arrIdClasses = [];
               let noNameRel = [];
               let flagNoName = false;

               let codeWriter;
               codeWriter = new codegen.CodeWriter();
               codeWriter.setIndentString(codeWriter.getIndentString(this.options));
               codeWriter.writeLine('components:');
               //    codeWriter.indent();
               codeWriter.writeLine('schemas:' + (classes.length == 0 ? " {}" : ""), 1, 0);
               codeWriter.writeLine(null, 1, 0);
               //    codeWriter.indent();
               classes.forEach(objClass => {

                    let accosElems = objClass.ownedElements.filter(item => {
                         return item instanceof type.UMLAssociation;
                    });

                    let assocSideClassLink = classLink.filter(item => {
                         return item.associationSide.end2.reference._id == objClass._id;
                    });

                    let assocClassLink = classLink.filter(item => {
                         return item.associationSide.end1.reference._id == objClass._id;
                    });

                    codeWriter.writeLine(objClass.name + ":");
                    //   codeWriter.indent();
                    codeWriter.writeLine("type: object", 1, 0);
                    codeWriter.writeLine("properties:" + ((objClass.attributes.length == 0 && accosElems.length == 0 && assocClassLink.length == 0) ? " {}" : ""));
                    codeWriter.writeLine(null, 1, 0);

                    let arrAttr = [];

                    let i, len;
                    for (i = 0, len = objClass.attributes.length; i < len; i++) {
                         let attr = objClass.attributes[i];
                         let filterAttr = arrAttr.filter(item => {
                              return item.name == attr.name;
                         });
                         if (filterAttr.length == 0) {
                              arrAttr.push(attr);
                              if (assocSideClassLink.length > 0 && attr.isID) {
                                   continue;
                              }
                              // if(!attr.isID ){
                              codeWriter.writeLine(attr.name + ":");
                              if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                                   //    codeWriter.indent();
                                   codeWriter.writeLine("items:", 1, 0);
                                   //    codeWriter.indent();
                                   codeWriter.writeLine("description: '" + (attr.documentation ? this.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                                   codeWriter.writeLine("type: " + this.getType(attr.type), 0, 1);
                                   //    codeWriter.outdent();  
                                   codeWriter.writeLine("type: array");
                                   /**
                                    * Add MinItems of multiplicity is 1..*
                                    */
                                   if (attr.multiplicity === "1..*") {
                                        codeWriter.writeLine("minItems: 1");
                                   }
                                   codeWriter.writeLine(null, 0, 1);
                                   //    codeWriter.outdent();  
                              } else {
                                   //    codeWriter.indent();
                                   codeWriter.writeLine("description: '" + (attr.documentation ? this.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                                   codeWriter.writeLine("type: " + this.getType(attr.type));
                                   if (attr.type instanceof type.UMLEnumeration) {
                                        codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) + "]");
                                   }
                                   codeWriter.writeLine(null, 0, 1);
                                   //    codeWriter.outdent(); 
                              }
                              if (attr.defaultValue != "") {
                                   //    codeWriter.indent();
                                   codeWriter.writeLine("default: '" + attr.defaultValue + "'", 1, 1);
                                   //    codeWriter.outdent();
                              }
                              // }

                         }
                    }

                    let arrAssoc = [];



                    /**
                     * Add asscociation class Properties
                     * eg.
                     *   TransportMeansParty
                              allOf:
                             - $ref: '#/components/schemas/TransportPartyIds'
                             - $ref: '#/components/schemas/TransportMeansParty'
                             - type: object
                     */
                    if (assocClassLink.length > 0) {
                         assocClassLink.forEach(item => {
                              this.writeAssociationClassProperties(codeWriter, item);
                              arrAssoc.push(item.classSide);
                         })
                    }


                    let arrGeneral = this.findGeneralizationOfClass(objClass); // Git issue #12




                    let aggregationClasses = [];

                    let classAssociations = this.findAssociationOfClass(objClass);

                    // Git issue #12
                    classAssociations.forEach(assoc => {
                         // for (i = 0, len = objClass.ownedElements.length; i < len; i++) {
                         //     let assoc = objClass.ownedElements[i];
                         if (assoc instanceof type.UMLAssociation) {

                              let filterAssoc = arrAssoc.filter(item => {
                                   return item.name == assoc.name;
                              });


                              if (filterAssoc.length == 0 && assoc.name != "") {

                                   if (assoc.end1.aggregation == "shared") {
                                        // this.writeAssociationProperties(codeWriter,assoc);
                                        aggregationClasses.push(assoc.end2.reference);
                                        codeWriter.writeLine(assoc.name + ":"); // #7 resolve issue
                                        //    codeWriter.indent();
                                        codeWriter.writeLine(null, 1, 0);
                                        if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {
                                             codeWriter.writeLine("items:");
                                             //   codeWriter.indent();
                                             codeWriter.writeLine("allOf:", 1, 0);
                                             //   codeWriter.indent();
                                             codeWriter.writeLine("- $ref: '#/components/schemas/" + assoc.end2.reference.name + "Ids'", 1, 0);
                                             codeWriter.writeLine("- type: object", 0, 2);
                                             //   codeWriter.outdent();
                                             //   codeWriter.outdent();
                                             codeWriter.writeLine("type: array");
                                             if (assoc.end2.multiplicity == "1..*") {
                                                  codeWriter.writeLine("minItems: 1");
                                             }
                                             //   codeWriter.outdent();
                                             codeWriter.writeLine(null, 0, 1);
                                        } else {
                                             codeWriter.writeLine("allOf:");
                                             //   codeWriter.indent();
                                             codeWriter.writeLine("- $ref: '#/components/schemas/" + assoc.end2.reference.name + "Ids'", 1, 0);
                                             codeWriter.writeLine("- type: object", 0, 2);
                                             //   codeWriter.outdent();
                                             //   codeWriter.outdent();
                                        }
                                   } else {
                                        if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {
                                             codeWriter.writeLine(assoc.name + ":");
                                             //   codeWriter.indent();
                                             codeWriter.writeLine("items: {$ref: '#/components/schemas/" + assoc.end2.reference.name + "'}", 1, 0);
                                             codeWriter.writeLine("type: array");
                                             /**
                                              * Add MinItems of multiplicity is 1..*
                                              */
                                             if (assoc.end2.multiplicity === "1..*") {
                                                  codeWriter.writeLine("minItems: 1");
                                             }
                                             //   codeWriter.outdent();
                                             codeWriter.writeLine(null, 0, 1);
                                        } else {
                                             codeWriter.writeLine(assoc.name + ": {$ref: '#/components/schemas/" + assoc.end2.reference.name + "'}");
                                        }
                                   }
                                   arrAssoc.push(assoc);
                              } else {
                                   if (assoc.name == "") {
                                        flagNoName = true;
                                        let str = assoc.end1.reference.name + "-" + assoc.end2.reference.name;
                                        noNameRel.push(str);
                                   }
                              }
                         } else if (assoc instanceof type.UMLGeneralization) {
                              arrGeneral.push(assoc);
                         }
                    });



                    //   codeWriter.outdent();
                    codeWriter.writeLine(null, 0, 1);

                    /**
                     * Add Generalization class
                     * Inherite all properties of parent class
                     */
                    if (arrGeneral.length > 0) {
                         codeWriter.writeLine("allOf:");
                         //  codeWriter.indent();
                         codeWriter.writeLine(null, 1, 0);
                         arrGeneral.forEach(generalizeClass => {
                              codeWriter.writeLine("- $ref: '#/components/schemas/" + generalizeClass.target.name + "'");
                              codeWriter.writeLine("- type: object");
                         });
                         //  codeWriter.outdent();    
                         codeWriter.writeLine(null, 0, 1);
                    }

                    let filterAttributes = arrAttr.filter(item => {
                         return item.isID;
                    });


                    if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                         codeWriter.writeLine("allOf:");
                         //  codeWriter.indent();
                         codeWriter.writeLine("- $ref: '#/components/schemas/" + objClass.name + "Ids'", 1, 0);
                         codeWriter.writeLine("- type: object");
                         //  codeWriter.outdent();  
                         codeWriter.writeLine(null, 0, 1);
                    }

                    if (this.getRequiredAttributes(arrAttr).length > 0) {
                         codeWriter.writeLine("required: [" + this.getRequiredAttributes(arrAttr) + "]");
                    }
                    //   codeWriter.outdent();
                    codeWriter.writeLine(null, 0, 1);

                    /**
                     * Write sceparate schema for isID property of aggregation and relationship class
                     **/
                    if (assocSideClassLink.length > 0) {
                         aggregationClasses.push(objClass);
                         // this.writeAssociationProperties(codeWriter,objClass);
                    }
                    aggregationClasses.forEach(itemClass => {
                         let filter = arrIdClasses.filter(subItem => {
                              return itemClass.name == subItem.name;
                         });
                         if (filter.length == 0) {
                              this.writeAssociationProperties(codeWriter, itemClass);
                              arrIdClasses.push(itemClass)
                         }
                    });
               });

               //    if (noNameRel.length > 0) {
               //        app.dialogs.showErrorDialog("There is no-name relationship between " + noNameRel.join() + " classes.");
               //        return 0;
               //    }
               codeWriter.writeLine(null, 0, 2);
               //    codeWriter.outdent();
               //    codeWriter.outdent();

               codeWriter.writeLine("info: {description: " + mainElem.name + " API - 1.0.0, title: " + mainElem.name + " API, version: '1.0.0'}")
               codeWriter.writeLine("openapi: 3.0.0");
               codeWriter.writeLine("paths:" + (this.operations.length == 0 ? " {}" : ""));


               this.writeOperation(codeWriter, this.options, mainElem);
               codeWriter.writeLine(null, 0, 1);
               codeWriter.writeLine("servers: []");


               this.fileGeneration(codeWriter, fullPath, mainElem, fileType);
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }

     }

     /**
      * @function fileGeneration
      * @description convert output file to json
      * @param {CodeWriter} codeWriter class instance
      * @param {string} fullPath
      * @param {UMLPackage} mainElem
      * @param {string} fileType
      */
     fileGeneration(codeWriter, fullPath, mainElem, fileType) {
          try {
               console.log("fileGeneration", fullPath);
               let basePath;
               if (fileType == 1) {
                    /**
                     * Convert yml data to JSON file
                     */
                    basePath = path.join(fullPath, mainElem.name + '.json');

                    try {
                         var doc = yaml.safeLoad(codeWriter.getData());
                         fs.writeFileSync(basePath, JSON.stringify(doc, null, 4));
                         console.log(doc);

                    } catch (error) {
                         console.error("Error generating JSON file", error);
                         this.writeErrorToFile(error);
                    }
               } else if (fileType == 2) {
                    /**
                     * Convert data to YML file
                     */

                    basePath = path.join(fullPath, mainElem.name + '.yml');
                    fs.writeFileSync(basePath, codeWriter.getData());
               } else {

                    /**
                     * Convert data to YML file
                     */
                    let basePathYML = path.join(fullPath, mainElem.name + '.yml');
                    fs.writeFileSync(basePathYML, codeWriter.getData());


                    /**
                     * Convert yml data to JSON file
                     */
                    try {
                         basePath = path.join(fullPath, mainElem.name + '.json');
                         var doc = yaml.safeLoad(codeWriter.getData());
                         fs.writeFileSync(basePath, JSON.stringify(doc, null, 4));
                         console.log(doc);
                    } catch (error) {
                         console.error(error);
                         this.writeErrorToFile(error);
                    }
               }
               app.toast.info("OpenAPI generation completed");
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }

     /**
      * @function writeOperation
      * @description Write Operation (Path)
      * @param {CodeWriter} codeWriter class instance
      */
     writeOperation(codeWriter) {
          try {
               let interReal = app.repository.select("@UMLInterfaceRealization");
               this.operations.forEach(objOperation => {
                    let filterInterface = interReal.filter(itemInterface => {
                         return itemInterface.target.name == objOperation.name;
                    });

                    if (filterInterface.length > 0) {


                         let objInterface = filterInterface[0];

                         let interfaceAssociation = app.repository.select(objInterface.target.name + "::@UMLAssociation");
                         let filterInterfaceAssociation = interfaceAssociation.filter(item => {
                              return item.end2.aggregation == "composite";
                         });

                         if (filterInterfaceAssociation.length == 0) {


                              codeWriter.writeLine("/" + objInterface.target.name + ":", 1, 0);

                              codeWriter.writeLine(null, 1, 0);

                              objInterface.target.operations.forEach(objOperation => {
                                   if (objOperation.name.toUpperCase() == "GET") {
                                        codeWriter.writeLine("get:", 0, 0);


                                        codeWriter.writeLine("tags:", 1, 0);

                                        codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                        codeWriter.writeLine("description: Get a list of " + objInterface.source.name, 0, 0);

                                        codeWriter.writeLine("parameters: " + (objOperation.parameters.filter(itemParameters => itemParameters.name != "id" && itemParameters.name != "identifier").length > 0 ?
                                             "" :
                                             "[]"), 0, 0);

                                        this.writeQueryParameters(codeWriter, objOperation);

                                        codeWriter.writeLine("responses:", 0, 0);

                                        codeWriter.writeLine("'200':", 1, 0);

                                        codeWriter.writeLine("content:", 1, 0);

                                        codeWriter.writeLine("application/json:", 1, 0);

                                        codeWriter.writeLine("schema:", 1, 0);

                                        codeWriter.writeLine("items: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 0);
                                        codeWriter.writeLine("type: array", 0, 3);



                                        codeWriter.writeLine("description: OK", 0, 3);



                                   } else if (objOperation.name.toUpperCase() == "POST") {
                                        codeWriter.writeLine("post:", 0, 0);


                                        codeWriter.writeLine("tags:", 1, 0);

                                        codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                        codeWriter.writeLine("description:  Create a new " + objInterface.source.name, 0, 0);

                                        this.buildRequestBody(codeWriter, objInterface);

                                        codeWriter.writeLine("responses:", 0, 0);

                                        codeWriter.writeLine("'201':", 1, 0);

                                        codeWriter.writeLine("content:", 1, 0);

                                        codeWriter.writeLine("application/json:", 1, 0);

                                        codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 2);


                                        codeWriter.writeLine("description: Created", 0, 3);




                                   }
                              });


                              codeWriter.writeLine(null, 0, 1);

                              let checkOperationArr = objInterface.target.operations.filter(item => {
                                   return item.name == "GET" || item.name == "PUT" || item.name == "DELTE";
                              });

                              if (checkOperationArr.length > 0) {
                                   let operationAttributes = objInterface.target.attributes.filter(item => {
                                        return item.name == "id" || item.name == "identifier";
                                   });
                                   operationAttributes.forEach(operationAttribute => {
                                        codeWriter.writeLine("/" + objInterface.target.name + "/{" + operationAttribute.name + "}:", 0, 0);

                                        codeWriter.writeLine(null, 1, 0);

                                        objInterface.target.operations.forEach(objOperation => {
                                             if (objOperation.name.toUpperCase() == "GET") {
                                                  codeWriter.writeLine("get:", 0, 0);


                                                  codeWriter.writeLine("tags:", 1, 0);

                                                  codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                                  codeWriter.writeLine("description: Get single " + objInterface.source.name + " by " + operationAttribute.name, 0, 0);
                                                  codeWriter.writeLine("parameters:", 0, 0);
                                                  this.buildParameter(codeWriter, operationAttribute.name, "path", (operationAttribute.documentation ? this.buildDescription(operationAttribute.documentation) : "missing description"), true, "{type: string}")

                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.buildParameter(codeWriter, itemAttribute.name, "query", (itemAttribute.documentation ? this.buildDescription(itemAttribute.documentation) : "missing description"), false, "{type: string}")
                                                       }
                                                  })

                                                  codeWriter.writeLine("responses:", 0, 0);

                                                  codeWriter.writeLine("'200':", 1, 0);

                                                  codeWriter.writeLine("content:", 1, 0);

                                                  codeWriter.writeLine("application/json:", 1, 0);

                                                  codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 2);



                                                  codeWriter.writeLine("description: OK", 0, 3);




                                             } else if (objOperation.name.toUpperCase() == "DELETE") {
                                                  codeWriter.writeLine("delete:", 0, 0);


                                                  codeWriter.writeLine("tags:", 1, 0);

                                                  codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                                  codeWriter.writeLine("description: Delete an existing " + objInterface.source.name, 0, 0);
                                                  codeWriter.writeLine("parameters:", 0, 0);
                                                  this.buildParameter(codeWriter, operationAttribute.name, "path", (operationAttribute.documentation ? this.buildDescription(operationAttribute.documentation) : "missing description"), true, "{type: string}")

                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.buildParameter(codeWriter, itemAttribute.name, "query", (itemAttribute.documentation ? this.buildDescription(itemAttribute.documentation) : "missing description"), false, "{type: string}")
                                                       }
                                                  });

                                                  codeWriter.writeLine("responses:", 0, 0);

                                                  codeWriter.writeLine("'204': {description: No Content}", 1, 2);



                                             } else if (objOperation.name.toUpperCase() == "PUT") {
                                                  codeWriter.writeLine("put:", 0, 0);


                                                  codeWriter.writeLine("tags:", 1, 0);

                                                  codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                                  codeWriter.writeLine("description: Update an existing " + objInterface.source.name, 0, 0);
                                                  codeWriter.writeLine("parameters:", 0, 0);
                                                  this.buildParameter(codeWriter, operationAttribute.name, "path", (operationAttribute.documentation ? this.buildDescription(operationAttribute.documentation) : "missing description"), true, "{type: string}")
                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.buildParameter(codeWriter, itemAttribute.name, "query", (itemAttribute.documentation ? this.buildDescription(itemAttribute.documentation) : "missing description"), false, "{type: string}")
                                                       }
                                                  });
                                                  this.buildRequestBody(codeWriter, objInterface);
                                                  codeWriter.writeLine("responses:", 0, 0);

                                                  codeWriter.writeLine("'200':", 1, 0);

                                                  codeWriter.writeLine("content:", 1, 0);

                                                  codeWriter.writeLine("application/json:", 1, 0);

                                                  codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 2);


                                                  codeWriter.writeLine("description: OK", 0, 3);




                                             } else if (objOperation.name.toUpperCase() == "PATCH") {
                                                  codeWriter.writeLine("patch:", 0, 0);


                                                  codeWriter.writeLine("tags:", 1, 0);

                                                  codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                                                  codeWriter.writeLine("description:  Update " + objInterface.source.name, 0, 0);
                                                  codeWriter.writeLine("parameters:", 0, 0);
                                                  this.buildParameter(codeWriter, operationAttribute.name, "path", (operationAttribute.documentation ? this.buildDescription(operationAttribute.documentation) : "missing description"), true, "{type: string}")
                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.buildParameter(codeWriter, itemAttribute.name, "query", (itemAttribute.documentation ? this.buildDescription(itemAttribute.documentation) : "missing description"), false, "{type: string}")
                                                       }
                                                  });
                                                  this.buildRequestBody(codeWriter, objInterface);

                                                  codeWriter.writeLine("responses:", 0, 0);

                                                  codeWriter.writeLine("'204': {description: No Content}", 1, 2);


                                             }
                                        });

                                        codeWriter.writeLine(null, 0, 1);
                                   });

                                   codeWriter.writeLine(null, 0, 1);
                              }

                         } else {
                              if (objInterface.target.ownedElements.length > 0) {
                                   let interfaceRelation = objInterface.target.ownedElements;
                                   interfaceRelation.forEach(interAsso => {
                                        if (interAsso instanceof type.UMLAssociation) {
                                             if (interAsso.end2.aggregation == "composite") {
                                                  this.writeInterfaceComposite(codeWriter, objInterface, interAsso);
                                             }
                                        }
                                   });
                              }
                         }

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }

     /**
      * @function buildDescription
      * @description Description replace (') with ('')
      * @param {string} desc
      */
     buildDescription(desc) {
          if (desc)
               return desc.replace(/\'/g, "''")

          return null;
     }

     /**
      * @function buildParameter
      * @description Adds parameters to the file
      * @param {CodeWriter} codeWriter class instance
      * @param {string} name
      * @param {string} type
      * @param {string} description
      * @param {boolean} required
      * @param {string} schema 
      */
     buildParameter(codeWriter, name, type, description, required, schema) {
          // codeWriter.writeLine("parameters:");
          codeWriter.writeLine("- description: " + description, 0, 0);

          codeWriter.writeLine("in: " + type, 1, 0);
          codeWriter.writeLine("name: " + name, 0, 0);
          codeWriter.writeLine("required: " + required, 0, 0);
          codeWriter.writeLine("schema: " + schema, 0, 1);

     }

     /**
      * @function buildRequestBody
      * @description Build request body for api
      * @param {CodeWriter} codeWriter class instance 
      * @param {UMLInterfaceRealization} objInterface 
      */
     buildRequestBody(codeWriter, objInterface) {
          codeWriter.writeLine('requestBody:', 0, 0);

          codeWriter.writeLine("content:", 1, 0);

          codeWriter.writeLine("application/json:", 1, 0);

          codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 2);


          codeWriter.writeLine("description: ''", 0, 0);
          codeWriter.writeLine("required: true", 0, 1);

     }

     /**
      * @function getEnumerationLiteral
      * @description 
      * @param {UMLEnumaration} objEnum 
      */
     getEnumerationLiteral(objEnum) {
          if (objEnum) {
               let result = objEnum.literals.map(a => a.name);
               return (result);
          }
     }

     /**
      * @function getRequiredAttributes
      * @description 
      * @param {UMLAttributes[]} arrAttributes 
      * @returns {Array} array of string
      */
     getRequiredAttributes(arrAttributes) {
          if (arrAttributes) {
               let requiredAttr = [];
               arrAttributes.forEach(item => {
                    if (item.multiplicity == "1" || item.multiplicity == "1..*") {
                         requiredAttr.push(item.name);
                    }

               });
               return (requiredAttr);
          }
     }

     /**
      * @function writeAssociationProperties
      * @description 
      * @param {CodeWriter} codeWriter class instance 
      * @param {UMLClass} assciation 
      */
     writeAssociationProperties(codeWriter, assciation) {
          try {
               let tempClass;
               if (assciation instanceof type.UMLAssociation) {
                    tempClass = assciation.end2.reference;

               } else {
                    tempClass = assciation;
               }

               let generalizeClasses = this.findGeneralizationOfClass(tempClass);

               let filterAttributes = tempClass.attributes.filter(item => {
                    return item.isID;
               });

               generalizeClasses.forEach(genClass => {
                    let genClassAttr = genClass.target.attributes.filter(item => {
                         return item.isID;
                    });
                    filterAttributes = filterAttributes.concat(genClassAttr);
               });

               // if (filterAttributes.length > 0) {

               codeWriter.writeLine((assciation instanceof type.UMLAssociation) ? (assciation.name + ":") : (tempClass.name + "Ids:"), 0, 0);

               codeWriter.writeLine("type: object", 1, 0);
               // codeWriter.writeLine("properties:", 0, 0);
               codeWriter.writeLine("properties:" + ((filterAttributes.length == 0) ? " {}" : ""));

               codeWriter.writeLine(null, 1, 0);

               filterAttributes.forEach(attr => {

                    codeWriter.writeLine(attr.name + ":", 0, 0);
                    if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {

                         codeWriter.writeLine("items:", 1, 0);

                         codeWriter.writeLine("description: '" + (attr.documentation ? this.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                         codeWriter.writeLine("type: " + this.getType(attr.type), 0, 1);

                         codeWriter.writeLine("type: array", 0, 0);
                         /**
                          * Add MinItems of multiplicity is 1..*
                          */
                         if (attr.multiplicity === "1..*") {
                              codeWriter.writeLine("minItems: 1", 0, 0);
                         }

                         codeWriter.writeLine(null, 0, 1);
                    } else {

                         codeWriter.writeLine("description: '" + (attr.documentation ? this.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                         codeWriter.writeLine("type: " + this.getType(attr.type), 0, 0);
                         if (attr.type instanceof type.UMLEnumeration) {
                              codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) + "]", 0, 0);
                         }

                         codeWriter.writeLine(null, 0, 1);
                    }
               });


               codeWriter.writeLine(null, 0, 1);

               if (this.getRequiredAttributes(filterAttributes).length > 0) {
                    codeWriter.writeLine("required: [" + this.getRequiredAttributes(filterAttributes) + "]", 0, 0);
               }


               codeWriter.writeLine(null, 0, 1);
               // }
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }


     /**
      * @function writeAssociationClassProperties
      * @description adds property for association class
      * @param {CodeWriter} codeWriter class instance
      * @param {UMLAssociationClassLink} associationClass 
      */
     writeAssociationClassProperties(codeWriter, associationClass) {
          try {
               var end2Attributes = associationClass.associationSide.end2.reference.attributes;
               var classSideAtributes = associationClass.classSide.attributes;
               codeWriter.writeLine(associationClass.classSide.name + ":", 0, 0);


               if (associationClass.associationSide.end2.multiplicity == "0..*" || associationClass.associationSide.end2.multiplicity == "1..*") {

                    codeWriter.writeLine("items:", 1, 0);

                    codeWriter.writeLine("allOf:", 1, 0);

                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'", 1, 0);
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.classSide.name + "'", 0, 0);
                    codeWriter.writeLine("- type: object", 0, 2);


                    codeWriter.writeLine("type: array", 0, 0);
                    if (associationClass.associationSide.end2.multiplicity == "1..*") {
                         codeWriter.writeLine("minItems: 1", 0, 0);
                    }

                    codeWriter.writeLine(null, 0, 1);
               } else {
                    codeWriter.writeLine("allOf:", 0, 0);

                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'", 1, 0);
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.classSide.name + "'", 0, 0);
                    codeWriter.writeLine("- type: object", 0, 2);


               }


               // classSideAtributes.forEach(attr => {
               //         codeWriter.writeLine(attr.name+":");
               //         codeWriter.indent();
               //         codeWriter.writeLine("description: '"+(attr.documentation?this.buildDescription(attr.documentation):"missing description")+"'");
               //         codeWriter.writeLine("type: "+  this.getType(attr.type) );
               //         if(attr.type instanceof type.UMLEnumeration){
               //             codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) +"]");                            
               //         }   
               //         codeWriter.outdent();

               // });

               // end2Attributes.forEach(attr => {
               //     if(attr.isID){
               //         codeWriter.writeLine(attr.name+":");
               //         codeWriter.indent();
               //         codeWriter.writeLine("description: '"+(attr.documentation?this.buildDescription(attr.documentation):"missing description")+"'");
               //         codeWriter.writeLine("type: "+  this.getType(attr.type) );
               //         if(attr.type instanceof type.UMLEnumeration){
               //             codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) +"]");                            
               //         }   
               //         codeWriter.outdent();
               //     }
               // });



          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }

     /**
      * @function writeInterfaceComposite
      * @description Adds interface composision
      * @param {CodeWriter} codeWriter class instance
      * @param {UMLInterfaceRealization} interfaceRealization 
      * @param {UMLAssociation} interfaceAssociation 
      */
     writeInterfaceComposite(codeWriter, interfaceRealization, interfaceAssociation) {
          try {
               let end1Interface = interfaceAssociation.end1;
               let end2Interface = interfaceAssociation.end2;
               codeWriter.writeLine(null, 1, 0);
               interfaceRealization.target.operations.forEach(objOperation => {
                    if (objOperation.name.toUpperCase() == "GET") {

                         /* Get all list */
                         codeWriter.writeLine("/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + ":", 0, 0);

                         codeWriter.writeLine("get:", 1, 0);


                         codeWriter.writeLine("tags:", 1, 0);

                         codeWriter.writeLine("- " + interfaceRealization.target.name, 1, 1);


                         codeWriter.writeLine("description: Get a list of " + interfaceRealization.source.name, 0, 0);
                         codeWriter.writeLine("parameters:", 0, 0);
                         this.buildParameter(codeWriter, end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")

                         codeWriter.writeLine("responses:", 0, 0);

                         codeWriter.writeLine("'200':", 1, 0);

                         codeWriter.writeLine("content:", 1, 0);

                         codeWriter.writeLine("application/json:", 1, 0);

                         codeWriter.writeLine("schema:", 1, 0);

                         codeWriter.writeLine("items: {$ref: '#/components/schemas/" + interfaceRealization.source.name + "'}", 1, 0);
                         codeWriter.writeLine("type: array", 0, 3);



                         codeWriter.writeLine("description: OK", 0, 4);





                         /* Get single element record */
                         codeWriter.writeLine("/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}:", 0, 0);

                         codeWriter.writeLine("get:", 1, 0);


                         codeWriter.writeLine("tags:", 1, 0);

                         codeWriter.writeLine("- " + interfaceRealization.target.name, 1, 1);


                         codeWriter.writeLine("description: Get a list of " + interfaceRealization.source.name, 0, 0);
                         codeWriter.writeLine("parameters:", 0, 0);
                         this.buildParameter(codeWriter, end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")
                         this.buildParameter(codeWriter, end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? this.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")

                         codeWriter.writeLine("responses:", 0, 0);

                         codeWriter.writeLine("'200':", 1, 0);

                         codeWriter.writeLine("content:", 1, 0);

                         codeWriter.writeLine("application/json:", 1, 0);

                         codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + interfaceRealization.source.name + "'}", 1, 2);



                         codeWriter.writeLine("description: OK", 0, 4);




                    } else if (objOperation.name.toUpperCase() == "POST") {
                         codeWriter.writeLine("/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + ":", 0, 0);

                         codeWriter.writeLine("post:", 1, 0);


                         codeWriter.writeLine("tags:", 1, 0);

                         codeWriter.writeLine("- " + interfaceRealization.target.name, 1, 1);


                         codeWriter.writeLine("description:  Create a new " + interfaceRealization.source.name, 0, 0);
                         codeWriter.writeLine("parameters:", 0, 0);
                         this.buildParameter(codeWriter, end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")

                         this.buildRequestBody(codeWriter, interfaceRealization);

                         codeWriter.writeLine("responses:", 0, 0);

                         codeWriter.writeLine("'201':", 1, 0);

                         codeWriter.writeLine("content:", 1, 0);

                         codeWriter.writeLine("application/json:", 1, 0);

                         codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + interfaceRealization.source.name + "'}", 1, 2);


                         codeWriter.writeLine("description: Created", 0, 4);





                    } else if (objOperation.name.toUpperCase() == "DELETE") {
                         codeWriter.writeLine("/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}:", 0, 0);

                         codeWriter.writeLine("delete:", 1, 0);


                         codeWriter.writeLine("tags:", 1, 0);

                         codeWriter.writeLine("- " + objInterface.target.name, 1, 1);


                         codeWriter.writeLine("description: Delete an existing " + objInterface.source.name, 0, 0);
                         codeWriter.writeLine("parameters:", 0, 0);
                         this.buildParameter(codeWriter, end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")
                         this.buildParameter(codeWriter, end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? this.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")

                         codeWriter.writeLine("responses:", 0, 0);

                         codeWriter.writeLine("'204': {description: No Content}", 1, 3);




                    }
               });
               codeWriter.writeLine(null, 0, 1);
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }

     /**
      * @function findAssociationOfClass
      * @description Find all association of UMLClass
      * @param {UMLClass} objClass 
      */
     findAssociationOfClass(objClass) {
          try {
               let associations = app.repository.select("@UMLAssociation");
               let filterAssociation = associations.filter(item => {
                    return item.end1.reference._id == objClass._id
               });
               console.log(objClass.name, filterAssociation);
               return filterAssociation;
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }

     }

     /**
      * @function findGeneralizationOfClass
      * @description Find all generalization of UMLClass
      * @param {UMLClass} objClass 
      */
     findGeneralizationOfClass(objClass) {
          try {
               let generalizeClasses = app.repository.select("@UMLGeneralization");
               let filterGeneral = generalizeClasses.filter(item => {
                    return item.source._id == objClass._id
               });
               return filterGeneral;
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }
     /**
      * @function writeQueryParameters
      * @description Ads query paramater 
      * @param {CodeWriter} codeWriter class instance
      * @param {UMLOperation} objOperation
      */
     writeQueryParameters(codeWriter, objOperation) {
          try {
               objOperation.parameters.forEach(itemParameters => {
                    if (itemParameters.name != "id" && itemParameters.name != "identifier") {
                         if (!(itemParameters.type instanceof type.UMLClass)) {
                              this.buildParameter(codeWriter, itemParameters.name, "query", (itemParameters.documentation ?
                                   this.buildDescription(itemParameters.documentation) :
                                   "missing description"), false, "{type: string}");
                         } else {

                              let param = itemParameters.type.attributes.filter(item => {
                                   return itemParameters.name.toUpperCase() == item.name.toUpperCase();
                              });

                              if (param.length == 0) {
                                   let generalizeClasses = this.findGeneralizationOfClass(itemParameters.type);
                                   console.log(generalizeClasses);
                                   param = generalizeClasses[0].target.attributes.filter(item => {
                                        return itemParameters.name.toUpperCase() == item.name.toUpperCase();
                                   });
                              }

                              if (param[0].type == "DateTime") {
                                   this.buildParameter(codeWriter, "before_" + param[0].name, "query", (itemParameters.documentation ?
                                        this.buildDescription(itemParameters.documentation) :
                                        "missing description"), false, "{type: string}");
                                   this.buildParameter(codeWriter, "after_" + param[0].name, "query", (itemParameters.documentation ?
                                        this.buildDescription(itemParameters.documentation) :
                                        "missing description"), false, "{type: string}");

                              } else {
                                   this.buildParameter(codeWriter, param[0].name, "query", (itemParameters.documentation ?
                                        this.buildDescription(itemParameters.documentation) :
                                        "missing description"), false, "{type: string}");
                              }

                         }
                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }
     /**
      * @function writeErrorToFile
      * @description Catch the error and write it to file
      * @param {*} error
      * @memberof OpenApiGenerator
      */
     writeErrorToFile(error) {
          this.errorContent.push(error.message);
          fs.writeFile(this.mFilePath + this.mFileName, JSON.stringify(this.errorContent), function(err) {
               if (err) {
                    console.error("Error writing file", err);
               }
          });
     }

}

exports.OpenApiGenerator = OpenApiGenerator;