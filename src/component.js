const fs = require('fs');
const path = require('path');
const forEach = require('async-foreach').forEach;
const utils = require('./utils');
const camelize = require('../src/camelize');
const Generalization = require('./generalization');
const Properties = require('./properties');
const AssociationClassLink = require('./associationClassLink');
const Aggregation = require('./aggregation');
const Composition = require('./composition');
const Required = require('./required');
const openAPI = require('./openapi');
const constant = require('./constant');
const dElement = require('./diagram/dElement');
const notAvailElement = require('./notavailelement');

/**
 * @class Component 
 * @description class adds all classes from the class diagram
 */
class Component {
     /**
      * Creates an instance of Component.
      * @param {string} fullPath
      * @memberof Component
      */
     constructor() {
          this.mainComponentObj = {};
          this.mainSchemaObj = {};
          utils.resetErrorBlock();
          this.arrAttRequired = [];
          /* this.arrAssoc = []; */
          this.required = new Required();
          this.generalization = new Generalization();
          this.associationClassLink = new AssociationClassLink();
     }

     /**
      * @function getComponent
      * @description Returns component object 
      * @returns {Object}
      * @memberof Component
      */
     getComponent() {
          let classes, assoClassLink;
          classes = openAPI.getClasses();
          assoClassLink = app.repository.select("@UMLAssociationClassLink");

          /* Add classes that class's attribute type is Core Data Type  
          Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount
          */

          let arrCoreDataTypeAttr = utils.getCoreDataTypeAttributeClass(classes);

          /* Throw error if attribute type is not available in model 
          Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount */
          let notAvailEle = notAvailElement.getNotAvailableClassOrEnumeInFile();
          if (notAvailEle.length > 0) {
               let dlgMessage = constant.WARNING_VOCAB_MSG;
               forEach(notAvailEle, function (item) {
                    dlgMessage += '\n' + item;
               });
               throw new Error(dlgMessage);
          }

          /* Combine classes and classes that class's attribute type is Core Data Type */
          classes = classes.concat(arrCoreDataTypeAttr);


          let arrIdClasses = [];
          this.mainComponentObj.schemas = this.mainSchemaObj;
          this.duplicatePropertyError = [];
          let duplicateDeletedReference = [];
          /* Iterate through all classes*/
          classes.forEach(objClass => {
               let mainClassesObj = {};
               let mainPropertiesObj = {};

               /* Filter Association Class Link of Current Class */
               let assocSideClassLink = assoClassLink.filter(item => {
                    return item.associationSide.end2.reference._id == objClass._id;
               });

               /* Filter Association Class Link of Current Class */
               let assocClassLink = assoClassLink.filter(item => {
                    return item.associationSide.end1.reference._id == objClass._id;
               });

               this.mainSchemaObj[objClass.name] = mainClassesObj

               mainClassesObj.type = 'object';

               /* Adding Properties */
               let properties = new Properties(objClass, assocSideClassLink);
               /* Adds Attributes, With Enum, With Multiplicity */
               mainPropertiesObj = properties.addProperties();
               mainClassesObj.properties = mainPropertiesObj;

               let compositionRef = [];

               this.arrAttRequired = properties.getRequiredAttributes();


               /* Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity */
               mainPropertiesObj = this.associationClassLink.addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj, compositionRef);



               /* Get generalization of class */
               let arrGeneral = this.generalization.findGeneralizationOfClass(objClass);
               let aggregationClasses = [];
               let classAssociations = this.associationClassLink.getAssociationOfClass(objClass);

               console.log("classAssociations", classAssociations);
               console.log("mainPropertiesObj", mainPropertiesObj);

               classAssociations.forEach(assoc => {
                    if (assoc instanceof type.UMLAssociation) {


                         let assocName = assoc.name;
                         if (assocName == '') {
                              assocName = assoc.end2.reference.name;
                         }

                         /* Check for duplicate property */
                         let propKeys = Object.keys(mainPropertiesObj);
                         propKeys.forEach(prop => {
                              if (assocName == prop) {
                                   let error = "There is duplicate property in class \'" + assoc.end1.reference.name + "\' and property name is \'" + prop + "\'";
                                   this.duplicatePropertyError.push(error);
                                   let jsonError = {
                                        isDuplicateProp: true,
                                        msg: this.duplicatePropertyError
                                   };
                                   openAPI.setError(jsonError);
                              }
                         });

                         if (assoc.end1.aggregation == constant.shared) {
                              /* Adding Aggregation : Adds Attributes with Multiplicity, without Multiplicity */
                              let aggregation = new Aggregation(this.arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = aggregation.addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName, compositionRef);

                         } else {
                              /* Adding composition : Adds Attributes with Multiplicity, without Multiplicity */
                              let composition = new Composition(this.arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = composition.addComposition(mainPropertiesObj, assoc, assocName, compositionRef);
                              // if(objClass.name == 'Logistics_TransportMovement' ){
                              //      console.log("inner");
                              // }

                         }
                    } else if (assoc instanceof type.UMLGeneralization) {
                         arrGeneral.push(assoc);
                    }
               });

               /* Adding Generalization : Adds refs of Class in 'allOf' object */
               mainClassesObj = this.generalization.addGeneralization(arrGeneral, mainClassesObj, compositionRef);


               let filterAttributes = this.arrAttRequired.filter(item => {
                    return item.isID;
               });

               /* Generate Ids Class if needed */
               if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                    let allOfArray = [];
                    mainClassesObj.allOf = allOfArray;
                    let allOfObj = {};
                    allOfObj['$ref'] = constant.getReference() + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);

               }

               /* Adding Required (Mandatory fields) */
               if (this.required.getRequiredAttributes(this.arrAttRequired).length > 0) {
                    mainClassesObj.required = this.required.addRequiredAttributes(this.arrAttRequired);
               }

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (assocSideClassLink.length > 0) {
                    aggregationClasses.push(objClass);
               }

               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });

                    if (filter.length == 0) {
                         this.associationClassLink.writeAssociationProperties(mainClassesObj, itemClass, this.mainSchemaObj);
                         arrIdClasses.push(itemClass)
                    }
               });
               // if(objClass.name == 'Logistics_TransportMovement' ){
               console.log("compositionRef", compositionRef);
               /* Remove property which is already in ref of other property in the same schema */
               this.removeDuplicatePropertyOfRefs(compositionRef, mainPropertiesObj, objClass, duplicateDeletedReference);

               // }
          });
          console.log("Total duplicate deleted reference", duplicateDeletedReference);
          return this.mainComponentObj;
     }

     getComponentForDiagram() {
          let mClassesView, mAssoClassLinkView;
          mClassesView = dElement.getUMLClassView();
          mAssoClassLinkView = dElement.getUMLAssociationClassLinkView();

          /* Add classes that class's attribute type is Core Data Type  
          Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount
          */

          let arrCoreDataTypeAttr = utils.getCoreDataTypeAttributeClass(null);

          /* Throw error if attribute type is not available in model 
          Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount */
          let notAvailEle = notAvailElement.getNotAvailableClassOrEnumeInFile();
          if (notAvailEle.length > 0) {
               let dlgMessage = constant.WARNING_VOCAB_MSG;
               forEach(notAvailEle, function (item) {
                    dlgMessage += '\n' + item;
               });
               throw new Error(dlgMessage);
          }

          /* Combine classes and classes that class's attribute type is Core Data Type */
          let coreTypeViews = [];
          arrCoreDataTypeAttr.filter(function (coreTypeElement) {
               let view = utils.getViewFromOther(coreTypeElement);
               if (view != null) {
                    coreTypeViews.push(view);
                    console.log("views", view);
               }
          });
          mClassesView = mClassesView.concat(coreTypeViews);


          let arrIdClasses = [];
          this.mainComponentObj.schemas = this.mainSchemaObj;
          let duplicatePropertyError = [];
          let duplicateDeletedReference = [];
          /* Iterate through all classes*/
          mClassesView.forEach(mClassView => {
               let mainClassesObj = {};
               let mainPropertiesObj = {};
               let objClass = null;
               objClass = mClassView.model;

               let aclAssocSideView = mAssoClassLinkView.filter(viewItem => {
                    return viewItem.model.associationSide.end2.reference._id == objClass._id;
               });

               let aclClassSideView = mAssoClassLinkView.filter(viewItem => {
                    return viewItem.model.associationSide.end1.reference._id == objClass._id;
               });

               this.mainSchemaObj[objClass.name] = mainClassesObj

               mainClassesObj.type = 'object';

               /* Adding Properties */
               let properties = new Properties(mClassView, aclAssocSideView);
               /* Adds Attributes, With Enum, With Multiplicity */
               mainPropertiesObj = properties.addProperties();
               mainClassesObj.properties = mainPropertiesObj;

               let compositionRef = [];

               let arrAttRequired = properties.getRequiredAttributes();

               /* Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity */
               mainPropertiesObj = this.associationClassLink.addAssociationClassLinkProperties(aclClassSideView, mainPropertiesObj, compositionRef);

               /* Get generalization of class */
               let arrGeneral = this.generalization.findGeneralizationOfClass(objClass);
               let aggregationClasses = [];
               let classAssociations = this.associationClassLink.getAssociationOfClass(objClass);

               console.log("classAssociations", classAssociations);
               console.log("mainPropertiesObj", mainPropertiesObj);

               classAssociations.forEach(assoc => {
                    if (assoc instanceof type.UMLAssociation) {


                         let assocName = assoc.name;
                         if (assocName == '') {
                              assocName = assoc.end2.reference.name;
                         }

                         /* Check for duplicate property */
                         let propKeys = Object.keys(mainPropertiesObj);
                         propKeys.forEach(prop => {
                              if (assocName == prop) {
                                   let error = "There is duplicate property in class \'" + assoc.end1.reference.name + "\' and property name is \'" + prop + "\'";
                                   duplicatePropertyError.push(error);
                                   let jsonError = {
                                        isDuplicateProp: true,
                                        msg: duplicatePropertyError
                                   };
                                   openAPI.setError(jsonError);
                              }
                         });


                         if (assoc.end1.aggregation == constant.shared) {
                              /* Adding Aggregation : Adds Attributes with Multiplicity, without Multiplicity */
                              let aggregation = new Aggregation(arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = aggregation.addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName, compositionRef);

                         } else {
                              /* Adding composition : Adds Attributes with Multiplicity, without Multiplicity */
                              let composition = new Composition(arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = composition.addComposition(mainPropertiesObj, assoc, assocName, compositionRef);
                              // if(objClass.name == 'Logistics_TransportMovement' ){
                              //      console.log("inner");
                              // }

                         }
                    } else if (assoc instanceof type.UMLGeneralization) {
                         arrGeneral.push(assoc);
                    }
               });

               /* Adding Generalization : Adds refs of Class in 'allOf' object */
               mainClassesObj = this.generalization.addGeneralization(arrGeneral, mainClassesObj, compositionRef);

               let filterAttributes = arrAttRequired.filter(item => {
                    return item.isID;
               });

               /* Generate Ids Class if needed */
               if (filterAttributes.length > 0 && aclAssocSideView.length > 0) {
                    let allOfArray = [];
                    mainClassesObj.allOf = allOfArray;
                    let allOfObj = {};
                    allOfObj['$ref'] = constant.getReference() + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);

               }

               /* Adding Required (Mandatory fields) */
               if (this.required.getRequiredAttributes(arrAttRequired).length > 0) {
                    mainClassesObj.required = this.required.addRequiredAttributes(arrAttRequired);
               }

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (aclAssocSideView.length > 0) {
                    aggregationClasses.push(objClass);
               }

               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });

                    if (filter.length == 0) {
                         this.associationClassLink.writeAssociationProperties(mainClassesObj, itemClass, this.mainSchemaObj);
                         arrIdClasses.push(itemClass)
                    }
               });
               // if(objClass.name == 'Logistics_TransportMovement' ){
               console.log("compositionRef", compositionRef);
               /* Remove property which is already in ref of other property in the same schema */
               this.removeDuplicatePropertyOfRefs(compositionRef, mainPropertiesObj, objClass, duplicateDeletedReference);

               // }

          });
          console.log("mainComponentObj", this.mainComponentObj);
          console.log("mainComponentObj-length", this.mainComponentObj.schemas.length);
          console.log("file-generate-started");
          let basePath = path.join('/home/vi109/Desktop', 'temp.json');
          fs.writeFileSync(basePath, JSON.stringify(this.mainComponentObj, null, 4));

          return this.mainComponentObj;

     }

     /**
      * @function getJSONSchema
      * @description Returns component object 
      * @returns {Object}
      * @memberof Component
      */
     getJSONSchema() {
          /* For Schema object */
          let schemaModel = {};
          this.mainSchemaObj = schemaModel;
          schemaModel['model'] = openAPI.getExportElementName();
          schemaModel['type'] = 'object';






          /* For Interface */
          let paths, interfaceRealalization;
          if (openAPI.isModelPackage()) {
               interfaceRealalization = app.repository.select("@UMLInterfaceRealization");
               paths = openAPI.getPaths();
          } else if (openAPI.isModelDiagram()) {
               interfaceRealalization = [];
               let interfaceRealalizationView=dElement.getUMLInterfaceRealizationView();
               forEach(interfaceRealalizationView, function (mView) {
                    interfaceRealalization.push(mView.model);
               });

               paths = [];
               let umlInterfaceView = dElement.getUMLInterfaceView();
               forEach(umlInterfaceView, function (mView) {
                    paths.push(mView.model);
               });
          }

          let schemaModelPropertiesObj = {};
          schemaModel['properties'] = schemaModelPropertiesObj;

          paths.forEach(path => {
               let objPath = {};
               let interfaceName = camelize.toCamelCaseString(path.name);
               schemaModelPropertiesObj[interfaceName] = objPath;
               let ref = interfaceRealalization.filter(real => {
                    return real.target._id == path._id;
               });
               ref.forEach(interfaceReal => {
                    objPath['$ref'] = '#' + constant.path + constant.definitions + constant.path + interfaceReal.source.name
               });
          });
          /* For Class */
          let classes, assoClassLink;
          if (openAPI.isModelPackage()) {
               classes = openAPI.getClasses();
               assoClassLink = app.repository.select("@UMLAssociationClassLink");
          } else if (openAPI.isModelDiagram()) {
               classes = [];
               let classesView = dElement.getUMLClassView();
               forEach(classesView, function (mView) {
                    classes.push(mView.model);
               });

               assoClassLink = [];
               let assoClassLinkView = dElement.getUMLAssociationClassLinkView();
               forEach(assoClassLinkView, function (mView) {
                    assoClassLink.push(mView.model);
               });
          }
          let arrIdClasses = [];

          let schemaModelDefinitionsObj = {};
          schemaModel['definitions'] = schemaModelDefinitionsObj;

          /* Add classes that class's attribute type is Core Data Type  
          Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount
          */

          let arrCoreDataTypeAttr = utils.getCoreDataTypeAttributeClass(classes);

          /* Throw error if attribute type is not available in model  */
          /* let notAvailEle = notAvailElement.getNotAvailableClassOrEnumeInFile();
          if (notAvailEle.length > 0) {
               let dlgMessage = constant.WARNING_VOCAB_MSG;
               forEach(notAvailEle, function (item) {
                    dlgMessage += '\n' + item;
               });
               throw new Error(dlgMessage);
          } */

          /* Combine classes and classes that class's attribute type is Core Data Type */
          classes = classes.concat(arrCoreDataTypeAttr);

          this.duplicatePropertyError = [];
          let duplicateDeletedReference = [];
          classes.forEach(objClass => {
               let mainClassesObj = {};
               let mainPropertiesObj = {};

               let assocSideClassLink = assoClassLink.filter(item => {
                    return item.associationSide.end2.reference._id == objClass._id;
               });

               console.log("-----track", assocSideClassLink);
               /* Filter Association Class Link of Current Class */
               let assocClassLink = assoClassLink.filter(item => {
                    return item.associationSide.end1.reference._id == objClass._id;
               });

               schemaModelDefinitionsObj[objClass.name] = mainClassesObj

               mainClassesObj.type = 'object';

               /* Adding Properties */
               let properties = new Properties(objClass, assocSideClassLink);
               /* Adds Attributes, With Enum, With Multiplicity */
               mainPropertiesObj = properties.addProperties();
               mainClassesObj.properties = mainPropertiesObj;

               let compositionRef = [];

               this.arrAttRequired = properties.getRequiredAttributes();


               /* Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity */
               mainPropertiesObj = this.associationClassLink.addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj, compositionRef);



               /* Get generalization of class */
               let arrGeneral = this.generalization.findGeneralizationOfClass(objClass);
               let aggregationClasses = [];
               let classAssociations = this.associationClassLink.getAssociationOfClass(objClass);


               console.log("classAssociations", classAssociations);
               console.log("mainPropertiesObj", mainPropertiesObj);



               classAssociations.forEach(assoc => {
                    if (assoc instanceof type.UMLAssociation) {


                         let assocName = assoc.name;
                         if (assocName == '') {
                              assocName = assoc.end2.reference.name;
                         }

                         /* Check for duplicate property */
                         let propKeys = Object.keys(mainPropertiesObj);
                         propKeys.forEach(prop => {
                              if (assocName == prop) {
                                   let error = "There is duplicate property in class \'" + assoc.end1.reference.name + "\' and property name is \'" + prop + "\'";
                                   this.duplicatePropertyError.push(error);
                                   let jsonError = {
                                        isDuplicateProp: true,
                                        msg: this.duplicatePropertyError
                                   };
                                   openAPI.setError(jsonError);
                              }
                         });

                         if (assoc.end1.aggregation == constant.shared) {
                              /* Adding Aggregation : Adds Attributes with Multiplicity, without Multiplicity */
                              let aggregation = new Aggregation(this.arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = aggregation.addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName, compositionRef);

                         } else {
                              /* Adding composition : Adds Attributes with Multiplicity, without Multiplicity */
                              let composition = new Composition(this.arrAttRequired);
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = composition.addComposition(mainPropertiesObj, assoc, assocName, compositionRef);
                              // if(objClass.name == 'Logistics_TransportMovement' ){
                              //      console.log("inner");
                              // }

                         }
                    } else if (assoc instanceof type.UMLGeneralization) {
                         arrGeneral.push(assoc);
                    }
               });

               /* Adding Generalization : Adds refs of Class in 'allOf' object */
               mainClassesObj = this.generalization.addGeneralization(arrGeneral, mainClassesObj, compositionRef);


               let filterAttributes = this.arrAttRequired.filter(item => {
                    return item.isID;
               });

               /* Generate Ids Class if needed */
               if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                    let allOfArray = [];
                    mainClassesObj.allOf = allOfArray;
                    let allOfObj = {};
                    allOfObj['$ref'] = constant.getReference() + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);

               }

               /* Adding Required (Mandatory fields) */
               if (this.required.getRequiredAttributes(this.arrAttRequired).length > 0) {
                    mainClassesObj.required = this.required.addRequiredAttributes(this.arrAttRequired);
               }

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (assocSideClassLink.length > 0) {
                    aggregationClasses.push(objClass);
               }

               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });

                    if (filter.length == 0) {
                         this.associationClassLink.writeAssociationProperties(mainClassesObj, itemClass, schemaModelDefinitionsObj);
                         arrIdClasses.push(itemClass)
                    }
               });
               // if(objClass.name == 'Logistics_TransportMovement' ){
               console.log("compositionRef", compositionRef);
               /* Remove property which is already in ref of other property in the same schema */
               this.removeDuplicatePropertyOfRefs(compositionRef, mainPropertiesObj, objClass, duplicateDeletedReference);

               // }
          });



          console.log("Total duplicate deleted reference", duplicateDeletedReference);
          return this.mainSchemaObj;
     }

     getJSONLayout() {
          let _this = this;
          let layout = [];

          /* For Interface */
          let paths, interfaceRealalization;
          if (openAPI.isModelPackage()) {
               interfaceRealalization = app.repository.select("@UMLInterfaceRealization");
               paths = openAPI.getPaths();
          } else if (openAPI.isModelDiagram()) {
               interfaceRealalization = [];
               let interfaceRealalizationView = dElement.getUMLInterfaceRealizationView();
               forEach(interfaceRealalizationView, function (mView) {
                    interfaceRealalization.push(mView.model);
               });

               paths = [];
               let umlInterfaceView = dElement.getUMLInterfaceView();
               forEach(umlInterfaceView, function (mView) {
                    paths.push(mView.model);
               });
          }

          paths.forEach(path => {
               let ref = interfaceRealalization.filter(real => {
                    return real.target.name == path.name;
               });
               ref.forEach(interfaceReal => {
                    /* Add root object to layout */
                    let mRootObject = {};
                    let source = interfaceReal.source;
                    let interfaceName = camelize.toCamelCaseString(source.name);
                    mRootObject['widget'] = 'message';
                    mRootObject['message'] = '<h1>' + interfaceName + '</h1>'
                    layout.push(mRootObject);


                    let allInheritedClasses = [];

                    _this.findAllInheritedClassesByGeneralization(allInheritedClasses, source);
                    let unique = [...new Set(allInheritedClasses.map(item => item._id))];
                    let uniqueArr = [];
                    uniqueArr.push(source);
                    forEach(unique, function (id) {
                         let obj = app.repository.get(id);
                         uniqueArr.push(obj);
                    });
                    console.log("all inherited classes", uniqueArr)
                    forEach(uniqueArr, function (mClasses) {


                         forEach(mClasses.attributes, function (attribute) {

                              /* Add attribute object to layout */
                              let mAttributeObj = {};
                              mAttributeObj['key'] = attribute.name;

                              /* Add required field to attribute */
                              if (attribute.multiplicity == "1" || attribute.multiplicity == "1..*") {
                                   mAttributeObj['required'] = true;
                              }


                              let attrType = attribute.type;
                              if (attrType instanceof type.UMLEnumeration) {
                                   /* Add type field to attribute */
                                   mAttributeObj['type'] = 'array';
                                   /* Add items array to attribute */
                                   let items = [];
                                   mAttributeObj['items'] = items;
                                   let literals = attrType.literals;
                                   forEach(literals, function (literal) {
                                        let literalObj = {};
                                        literalObj['key'] = literal.name;
                                        items.push(literalObj);
                                   });
                              } else if (attrType instanceof type.UMLClass || attrType instanceof type.UMLInterface) {
                                   /* Add type field to attribute */
                                   mAttributeObj['type'] = 'section';
                                   /* Add items array to attribute */
                                   let items = [];
                                   mAttributeObj['items'] = items;
                                   let sectionObj = {};
                                   sectionObj['key'] = attrType.name;
                                   items.push(sectionObj);
                              }
                              layout.push(mAttributeObj);
                         });

                    });
               });
          });
          return layout;
     }

     findAllInheritedClassesByGeneralization(allInheritedClasses, target) {
          let _this = this;
          let result = app.repository.select(target.name + '::@UMLGeneralization');
          forEach(result, function (item) {
               allInheritedClasses.push(item.target);
               _this.findAllInheritedClassesByGeneralization(allInheritedClasses, item.target)
          });
     }

     removeDuplicatePropertyOfRefs(compositionRef, mainPropertiesObj, objClass, duplicateDeletedReference) {

          /* Find duplicate properties */
          let tempDupliCheck = [];
          let uniqueArray = [];
          compositionRef.forEach(function (comp) {
               let result = tempDupliCheck.filter(function (item) {
                    return item.sName == comp.sName;
               });
               if (result.length == 0) {
                    tempDupliCheck.push(comp);
               } else {
                    uniqueArray.push(comp);
               }
          });
          console.log("Duplicate reference ", uniqueArray);

          /* Remove 'Ids' character from Schema name so we can delete it from duplicate property */
          let newUniqueArray = [];
          uniqueArray.forEach(function (item) {
               if (item.sName.endsWith("Ids")) {
                    item.sName = item.sName.replace('Ids', '');
               }
               newUniqueArray.push(item);
          });
          console.log("Duplicate reference : New", newUniqueArray);

          /* Remove duplicate property */
          newUniqueArray.forEach(function (comp) {
               if (mainPropertiesObj.hasOwnProperty(comp.sName)) {
                    delete mainPropertiesObj[comp.sName];
                    console.log("deleted duplicate attributes", comp.ref);

                    let objTemp = {};
                    objTemp[objClass.name] = comp
                    duplicateDeletedReference.push(objTemp);
               }
          });
     }

}

module.exports = Component;