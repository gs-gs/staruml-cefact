const nodeUtils = require('util');
const fs = require('fs');
const path = require('path');
const forEach = require('async-foreach').forEach;
const utils = require('./utils');
const camelize = require('../src/camelize');
const Generalization = require('./generalization');
const Properties = require('./properties');
const Association = require('./association');
const Aggregation = require('./aggregation');
const Composition = require('./composition');
const Required = require('./required');
const openAPI = require('./openapi');
const constant = require('./constant');
const dElement = require('./diagram/dElement');

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
          /* this.arrAssoc = []; */
          this.required = new Required();
          this.generalization = new Generalization();
          this.association = new Association();
     }

     /**
      * @function getComponent
      * @description Returns component object of selected UMLPackage
      * @returns {Object}
      * @memberof Component
      */
     getComponent() {
          let classes, dataTypes, enumerations, assoClassLink, arrCoreDataTypeAttr, mClassesView, mDataTypeView, mEnumerationView, mAssoClassLinkView;
          if (openAPI.isModelPackage()) {
               classes = openAPI.getClasses();
               //TODO: init dataTypes
               dataTypes = openAPI.getDataTypes();
               enumerations = [];
               assoClassLink = app.repository.select("@UMLAssociationClassLink");

               /* Add classes that class's attribute type is Core Data Type  
               Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount
               */
               arrCoreDataTypeAttr = utils.getCoreDataTypeAttributeClass(classes);

               /* Combine classes and classes that class's attribute type is Core Data Type */
               classes = classes.concat(arrCoreDataTypeAttr);
          } else if (openAPI.isModelDiagram()) {
               mClassesView = dElement.getUMLClassView();
               mDataTypeView = dElement.getUMLDataTypeView();
               mEnumerationView = dElement.getUMLEnumerationView();
               mAssoClassLinkView = dElement.getUMLAssociationClassLinkView();

               /* Add classes that class's attribute type is Core Data Type  
               Ex. Numeric, Identifier, Code, Indicator, DateTime, Text, Binary, Measure, Amount
               */
               arrCoreDataTypeAttr = utils.getCoreDataTypeAttributeClass(null);

               /* Combine classes and classes that class's attribute type is Core Data Type */
               let coreTypeViews = [];
               arrCoreDataTypeAttr.filter(function (coreTypeElement) {
                    let view = utils.getViewFromOther(coreTypeElement);
                    if (view != null) {
                         coreTypeViews.push(view);
                    }
               });
               mClassesView = mClassesView.concat(coreTypeViews);
          }


          let arrIdClasses = [];
          this.mainComponentObj.schemas = this.mainSchemaObj;
          let duplicatePropertyError = [];
          let duplicateDeletedReference = [];

          let classEleOrViews = null;
          let dataTypeEleOrViews = null;
          let enumerationEleOrViews = null;
          if (openAPI.isModelPackage()) {
               classEleOrViews = classes;
               dataTypeEleOrViews = dataTypes;
               enumerationEleOrViews = enumerations;
          } else if (openAPI.isModelDiagram()) {
               classEleOrViews = mClassesView;
               dataTypeEleOrViews = mDataTypeView;
               enumerationEleOrViews = mEnumerationView;
          }


          /**
           * Add class schema to schema object
           **/
          this.addClassSchema(classEleOrViews, assoClassLink, mAssoClassLinkView, arrIdClasses, duplicateDeletedReference, duplicatePropertyError);
          this.addDataTypesSchema(dataTypeEleOrViews);
          this.addEnumerationSchema(enumerationEleOrViews);
          /**
           * #113 treat referenced type classes in the same way as composition association targets.
           * Add Schema of those class which are referenced as Class in attribute type
           **/
          utils.resetClassTypeAttribute();
          let classTypeAttribute = utils.getClassTypeAttribute(classEleOrViews);
          this.addAttrTypeRefClassSchema(classTypeAttribute);
          let dataTypeAttribute = utils.getDataTypeAttribute(dataTypeEleOrViews);
          this.addAttrTypeRefClassSchema(dataTypeAttribute);
          openAPI.setModelType(openAPI.APP_MODEL_PACKAGE);

          return this.mainComponentObj;
     }

     /**
      * @function addAttrTypeRefClassSchema
      * @description Add schema of the class which are referenced as UMLClass in attribute type
      * @param {Object} refClasses
      * @memberof Component
      */
     addAttrTypeRefClassSchema(refClasses) {
          refClasses.forEach(objClass => {
               if(!utils.isCoreDataType(objClass)) {
                    let mainClassesObj = {};
                    let mainPropertiesObj = {};
                    let assocSideClassLink = [];

                    this.mainSchemaObj[utils.upperCamelCase(objClass.name)] = mainClassesObj
                    mainClassesObj.description = objClass.documentation;
                    mainClassesObj.type = 'object';

                    /**
                     * Adding Properties
                     **/
                    let properties = [];
                    properties = new Properties(objClass, assocSideClassLink, []);

                    /**
                     * Adds Attributes, With Enum, With Multiplicity
                     **/
                    mainPropertiesObj = properties.addPropertiesForAttrTypeRefClass();
                    mainClassesObj.properties = mainPropertiesObj;

                    let arrAttributes = properties.getAttributes();

                    /**
                     * Adding Required (Mandatory fields)
                     **/
                    if (this.required.getRequiredAttributes(arrAttributes).length > 0) {
                         mainClassesObj.required = this.required.addRequiredAttributes(arrAttributes);
                    }
               }

          });
     }


     addDataTypesSchema(dataTypeEleOrViews) {
          dataTypeEleOrViews.forEach(dataTypeEleOrViews => {
               let dataTypeObj = {};
               let dataTypePropertiesObj = {};
               let mDataTypeView = null;
               let objDataType = null;

               if (openAPI.isModelPackage()) {
                    objDataType = dataTypeEleOrViews;
               } else if (openAPI.isModelDiagram()) {
                    mDataTypeView = dataTypeEleOrViews;
                    objDataType = mDataTypeView.model;
               }

               this.mainSchemaObj[utils.upperCamelCase(objDataType.name)] = dataTypeObj;
               dataTypeObj.description = dataTypeObj.documentation ? utils.buildDescription(dataTypeObj.documentation) : constant.STR_MISSING_DESCRIPTION;
               dataTypeObj.type = 'string';
               let refTag;
               if (dataTypeEleOrViews.tags != null && dataTypeEleOrViews.tags.length > 0) {
                    forEach(dataTypeEleOrViews.tags, function (tag) {
                         if (tag.name === 'ref') {
                              refTag = tag.value;
                         }
                    });
               }
               if (refTag != null) {
                    dataTypeObj = {}
                    dataTypeObj.$ref = refTag;
               } else if(dataTypeEleOrViews.hasOwnProperty('attributes') && dataTypeEleOrViews['attributes'].length != 0) {
                    dataTypeObj.type = 'object';
                    let properties = {};
                    forEach(dataTypeEleOrViews.attributes, function (attribute) {
                         let propertyObj = {};
                         propertyObj.description = propertyObj.documentation ? utils.buildDescription(propertyObj.documentation) : constant.STR_MISSING_DESCRIPTION;
                         //TODO: check the type
                         propertyObj.type = attribute.type;
                         properties[attribute.name] = propertyObj;
                    });
                    dataTypeObj.properties = properties;
               } else if(dataTypeEleOrViews.hasOwnProperty('literals') && dataTypeEleOrViews['literals'].length != 0) {
                    let literals = [];
                    dataTypeObj['enum'] = literals;
                    let literalViews = [];
                    if (openAPI.isModelPackage()) {
                         literalViews = dataTypeEleOrViews.literals;
                         forEach(literalViews, literalView => {
                              let codeTag;
                              if (literalView.tags != null && literalView.tags.length > 0) {
                                   forEach(literalView.tags, function (tag) {
                                        if (tag.name === 'code') {
                                             codeTag = tag.value;
                                        }
                                   });
                              }
                         })
                    } else if (openAPI.isModelDiagram()) {
                         let enumView = utils.getViewFromCurrentDiagram(dataTypeEleOrViews);
                         if (enumView != null) {
                              let literalViews = utils.getVisibleLiteralsView(enumView);
                              forEach(literalViews, function (literalView) {
                                   literals.push(literalView.model);
                              });
                         }
                    }

                    forEach(dataTypeEleOrViews.tags, function (tag) {

                    });


                    let refTag;
                    if (dataTypeEleOrViews.tags != null && dataTypeEleOrViews.tags.length > 0) {
                         forEach(dataTypeEleOrViews.tags, function (tag) {
                              if (tag.name === 'ref') {
                                   refTag = tag.value;
                              }
                         });
                    }
               }
               /**
                * Adding Properties
                **/
               let properties = [];
               if (openAPI.isModelPackage()) {
                    properties = new Properties(objDataType, [], []);
               } else if (openAPI.isModelDiagram()) {
                    properties = new Properties(mDataTypeView, [], []);
               }

               /**
                * Adds Attributes, With Enum, With Multiplicity
                **/
               dataTypePropertiesObj = properties.addProperties();
               if (dataTypePropertiesObj!={}) {
                    dataTypeObj.type = 'object';
                    dataTypeObj.properties = dataTypePropertiesObj;
               };
          });
     }


     addEnumerationSchema(enumerationEleOrViews) {
          enumerationEleOrViews.forEach(enumerationEleOrView => {
               let enumerationObj = {};
               //TODO: check view variable usage
               let mEnumerationView = null;
               let objEnumeration = null;

               if(enumerationEleOrView.hasOwnProperty('model')){
                    mEnumerationView = enumerationEleOrView;
                    objEnumeration = mEnumerationView.model;
               } else {
                    objEnumeration = enumerationEleOrView;
               }

               if (this.mainSchemaObj[utils.upperCamelCase(objEnumeration.name)] == null) {

                    enumerationObj.enum = utils.getEnumerationLiteral(objEnumeration);
                    enumerationObj.description = objEnumeration.documentation ? utils.buildDescription(objEnumeration.documentation) : constant.STR_MISSING_DESCRIPTION;
                    enumerationObj.type = 'string';
                    if (enumerationObj.enum.length == 0) {
                         /**
                          * Check if the enumeration has a tag named 'ref'. If it presents use it as '$ref' value instead of including the enum to the specification
                          */
                         let refTag;
                         if (objEnumeration.tags != null && objEnumeration.tags.length > 0) {
                              forEach(objEnumeration.tags, function (tag) {
                                   if (tag.name === 'ref') {
                                        refTag = tag.value;
                                   }
                              });
                         }
                         if (refTag != null) {
                              enumerationObj = {}
                              enumerationObj.$ref = refTag;
                         } else {
                              app.dialogs.showAlertDialog('Enumeration ' + objEnumeration.name + ' has no values. You can add the enumeration to the diagram to include it or specify "ref" tag to refer to the external definition.');
                         }
                    }
                    this.mainSchemaObj[utils.upperCamelCase(objEnumeration.name)] = enumerationObj;
               }
          });
     }
     /**
      * @function addClassSchema
      * @description Add schema of the class which are referenced as UMLClass in attribute type
      * @param {Array} classEleOrViews
      * @param {Array} assoClassLink
      * @param {Array} mAssoClassLinkView
      * @param {Array} arrIdClasses
      * @param {Array} duplicateDeletedReference
      * @param {Array} duplicatePropertyError
      * @memberof Component
      */
     addClassSchema(classEleOrViews, assoClassLink, mAssoClassLinkView, arrIdClasses, duplicateDeletedReference, duplicatePropertyError) {
          classEleOrViews.forEach(classEleOrView => {
               let mainClassesObj = {};
               let mainPropertiesObj = {};
               let mClassView = null;
               let objClass = null;
               let assocSideClassLink, assocClassLink, aclAssocSideView, aclClassSideView;

               if (openAPI.isModelPackage()) {
                    objClass = classEleOrView;
                    /** 
                     * Filter class side Association Class Link of Current Class 
                     **/
                    assocSideClassLink = assoClassLink.filter(item => {
                         return item.associationSide.end2.reference._id == objClass._id;
                    });

                    /**  
                     * Filter association side Association Class Link of Current Class 
                     **/
                    assocClassLink = assoClassLink.filter(item => {
                         return item.associationSide.end1.reference._id == objClass._id;
                    });
               } else if (openAPI.isModelDiagram()) {
                    mClassView = classEleOrView;
                    objClass = mClassView.model;

                    /** 
                     * Filter class side Association Class Link view of Current Class view
                     **/
                    aclAssocSideView = mAssoClassLinkView.filter(viewItem => {
                         return viewItem.model.associationSide.end2.reference._id == objClass._id;
                    });

                    /** 
                     * Filter association Association Class Link view of Current Class view
                     **/
                    aclClassSideView = mAssoClassLinkView.filter(viewItem => {
                         return viewItem.model.associationSide.end1.reference._id == objClass._id;
                    });
               }
               if(!utils.isCoreDataType(objClass)) {
                    let interfaceRealalization = utils.getUMLInterfaceRealization(objClass._id);

                    this.mainSchemaObj[utils.upperCamelCase(objClass.name)] = mainClassesObj
                    mainClassesObj.description = objClass.documentation;
                    mainClassesObj.type = 'object';

                    /**
                     * Adding Properties
                     **/
                    let properties = [];
                    if (openAPI.isModelPackage()) {
                         properties = new Properties(objClass, assocSideClassLink, interfaceRealalization);
                    } else if (openAPI.isModelDiagram()) {
                         properties = new Properties(mClassView, aclAssocSideView, interfaceRealalization);
                    }

                    /**
                     * Adds Attributes, With Enum, With Multiplicity
                     **/
                    mainPropertiesObj = properties.addProperties();

                    let compositionRef = [];

                    let arrAttributes = properties.getAttributes();
                    let arrEnumerations = properties.getEnumerations();

                    this.addEnumerationSchema(arrEnumerations);

                    let arrDataTypes = properties.getDataTypes();
                    arrDataTypes.forEach(dataType => {
                         if (this.mainSchemaObj[utils.upperCamelCase(dataType.name)] == null) {
                              let dataTypeObj = {}
                              dataTypeObj.description = dataTypeObj.documentation ? utils.buildDescription(dataTypeObj.documentation) : constant.STR_MISSING_DESCRIPTION;
                              dataTypeObj.type = 'string';
                              let refTag;
                              if (dataType.tags != null && dataType.tags.length > 0) {
                                   forEach(dataType.tags, function (tag) {
                                        if (tag.name === 'ref') {
                                             refTag = tag.value;
                                        }
                                   });
                              }
                              if (refTag != null) {
                                   dataTypeObj = {}
                                   dataTypeObj.$ref = refTag;
                              } else if (dataType.hasOwnProperty('attributes')) {
                                   dataTypeObj.type = 'object';
                                   let properties = {};
                                   forEach(dataType.attributes, function (attribute) {
                                        let propertyObj = {};
                                        //TODO: check the type
                                        propertyObj.type = attribute.type;
                                        propertyObj.description = propertyObj.documentation ? utils.buildDescription(propertyObj.documentation) : constant.STR_MISSING_DESCRIPTION;
                                        properties[attribute.name] = propertyObj;
                                   });
                                   dataTypeObj.properties = properties;
                              }
                              this.mainSchemaObj[utils.upperCamelCase(dataType.name)] = dataTypeObj;
                         }
                    });

                    if (openAPI.isModelPackage()) {
                         /**
                          * Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity
                          **/
                         mainPropertiesObj = this.association.addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj, compositionRef);

                    } else if (openAPI.isModelDiagram()) {
                         /*
                          * Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity
                          */
                         mainPropertiesObj = this.association.addAssociationClassLinkProperties(aclClassSideView, mainPropertiesObj, compositionRef);
                    }


                    /**
                     * Get generalization of class
                     **/
                    let arrGeneral = this.generalization.findGeneralizationOfClass(objClass);
                    let aggregationClasses = [];

                    /**
                     * Get association class link of class
                     * */
                    let classAssociations = this.association.getAssociationOfClass(objClass);

                    /*
                     * Sort associations as it is showing in model exploert sequence
                     */
                    classAssociations = this.sortAssociationByModelExplorerSequence(objClass, classAssociations);


                    classAssociations.forEach(assoc => {
                         if (assoc instanceof type.UMLAssociation) {


                              let assocName = assoc.name;
                              if (assocName == '') {
                                   assocName = utils.lowerCamelCase(assoc.end2.reference.name);
                              }

                              /* Check for duplicate property */
                              let propKeys = Object.keys(mainPropertiesObj);
                              propKeys.forEach(prop => {
                                   if (assocName == prop) {
                                        let error = nodeUtils.format(constant.STR_DUPLICATE_PROPERTY, assoc.end1.reference.name, prop);
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
                                   let aggregation = new Aggregation(arrAttributes);
                                   mainPropertiesObj = aggregation.addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName, compositionRef);

                              } else {
                                   /* Adding composition : Adds Attributes with Multiplicity, without Multiplicity */
                                   let composition = new Composition(arrAttributes);
                                   mainPropertiesObj = composition.addComposition(mainPropertiesObj, assoc, assocName, compositionRef);

                              }
                         } else if (assoc instanceof type.UMLGeneralization) {
                              arrGeneral.push(assoc);
                         }
                    });

                    /**
                     * Adding Generalization : Adds refs of Class in 'allOf' object
                     **/
                    mainClassesObj = this.generalization.addGeneralization(arrGeneral, mainClassesObj, compositionRef);


                    let filterAttributes = arrAttributes.filter(item => {
                         return item.isID;
                    });

                    /**
                     * Generate Ids Class if needed
                     **/
                    if (openAPI.isModelPackage()) {

                         if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                              let allOfArray = [];
                              mainClassesObj.allOf = allOfArray;
                              let allOfObj = {};
                              allOfObj['$ref'] = constant.getReference() + utils.upperCamelCase(objClass.name + 'Ids');
                              allOfArray.push(allOfObj);
                         }
                    } else if (openAPI.isModelDiagram()) {
                         if (filterAttributes.length > 0 && aclAssocSideView.length > 0) {
                              let allOfArray = [];
                              mainClassesObj.allOf = allOfArray;
                              let allOfObj = {};
                              allOfObj['$ref'] = constant.getReference() + utils.upperCamelCase(objClass.name + 'Ids');
                              allOfArray.push(allOfObj);

                         }
                    }
                    let propKeys = Object.keys(mainPropertiesObj);
                    if (propKeys.length > 0) {
                         mainClassesObj.properties = mainPropertiesObj;
                    }

                    /**
                     * Adding Required (Mandatory fields)
                     **/
                    if (this.required.getRequiredAttributes(arrAttributes).length > 0) {
                         mainClassesObj.required = this.required.addRequiredAttributes(arrAttributes);
                    }

                    /**
                     * Write separate schema for isID property of aggregation and relationship class
                     **/
                    if (openAPI.isModelPackage() && assocSideClassLink.length > 0) {
                         aggregationClasses.push(objClass);
                    } else if (openAPI.isModelDiagram() && aclAssocSideView.length > 0) {
                         aggregationClasses.push(objClass);
                    }


                    aggregationClasses.forEach(itemClass => {
                         let filter = arrIdClasses.filter(subItem => {
                              return itemClass.name == subItem.name;
                         });

                         if (filter.length == 0) {
                              this.association.writeAssociationProperties(mainClassesObj, itemClass, this.mainSchemaObj);
                              arrIdClasses.push(itemClass)
                         }
                    });
                    /**
                     * Remove property which is already in ref of other property in the same schema
                     **/
                    this.removeDuplicatePropertyOfRefs(compositionRef, mainPropertiesObj, objClass, duplicateDeletedReference);
               }
          });
     }

     /**
      * @function sortAssociationByModelExplorerSequence
      * @description returns the array of associations in the sequence as shown in staruml model explorer
      * @returns {Array} newAssArr
      * @memberof Component
      */
     sortAssociationByModelExplorerSequence(objClass, classAssociations) {
          let newAssArr = [];
          let newClassAssociation = classAssociations;
          let sortByClassEle = app.repository.select(objClass.name + "::@UMLAssociation");
          let newSort = [];
          forEach(sortByClassEle, function (element) {
               let result = newClassAssociation.filter(function (srchEle) {
                    return element._id == srchEle._id;
               });


               if (result.length != 0) {
                    newSort.push(element);
               }
          });
          let otherSort = [];
          forEach(newClassAssociation, function (element) {
               let result = newSort.filter(function (srchEle) {
                    return element._id == srchEle._id;
               });

               if (result.length == 0) {
                    otherSort.push(element);
               }
          });
          newAssArr = newSort.concat(otherSort);
          return newAssArr;
     }

     /**
      * @function getJSONSchema
      * @description Returns component object 
      * @returns {Object}
      * @memberof Component
      */
     getJSONSchema() {
          /* For Schema object */
          let schemaMap = {};
          let reference = constant.getReference();
          let paths, interfaceRealalization;
          paths = openAPI.getPaths();
          interfaceRealalization = utils.fetchUMLInterfaceRealization();
          let schemaModelDefinitionsObj = {};
          schemaModelDefinitionsObj = this.getComponent();

          paths.forEach(path => {
               let ref = interfaceRealalization.filter(real => {
                    return real.target._id == path._id;
               });
               ref.forEach(interfaceReal => {
                    /* Class for schema->definitions object */

                    let resourceName = utils.upperCamelCase(interfaceReal.source.name);

                    let schemaObj = {};
                    schemaObj['$schema'] = 'http://json-schema.org/draft-07/schema#';
                    schemaObj['$id'] = '';
                    schemaObj['description'] = openAPI.getExportElementName();
                    schemaObj['type'] = 'object';
                    let schemas = schemaModelDefinitionsObj.schemas;
                    /*let propertiesObj = {};
                    let requiredArr = [];
                    if(schemas[resourceName].hasOwnProperty('allOf')){
                         let allOfArr = schemas[resourceName].allOf;
                         allOfArr.forEach(allOfEl => {
                            if (allOfEl.hasOwnProperty('$ref')){
                                 //TODO: add proper resolving - implement a recursion
                                 let refDefinition = allOfEl['$ref'];
                                 let definitionObj = schemas[refDefinition.substring(reference.length)];
                                 if (definitionObj.hasOwnProperty('properties')){
                                      let defProperties = definitionObj['properties'];
                                      propertiesObj = { ...propertiesObj, ...defProperties};
                                 }
                                 if (definitionObj.hasOwnProperty('required')){
                                      requiredArr = requiredArr.concat(definitionObj['required']);
                                 }
                            }
                         });
                    }
                    if(schemas[resourceName].hasOwnProperty('properties')){
                         propertiesObj = { ...propertiesObj, ...schemas[resourceName].properties};
                    }
                    schemaObj['properties'] = propertiesObj;

                    if(schemas[resourceName].hasOwnProperty('required')){
                         requiredArr = requiredArr.concat(schemas[resourceName].required);
                    }
                    schemaObj['required'] = requiredArr;

                    delete schemas[resourceName];
                    let components = {};
                    components['schemas'] = schemas;
                    schemaObj['components'] = components;
                    schemaMap[resourceName] = schemaObj;*/

                    let propertiesObj = {};
                    let objPath = {};
                    objPath['$ref'] = '#' + constant.path + constant.definitions + constant.path + interfaceReal.source.name;
                    propertiesObj[utils.lowerCamelCase(resourceName)] = objPath;
                    schemaObj['required'] = [];
                    schemaObj['required'].push(utils.lowerCamelCase(resourceName));
                    schemaObj['properties'] = propertiesObj;
                    schemaObj['definitions'] = schemas;
                    schemaMap[resourceName] = schemaObj;


               });
          });




          /* Interface for schema->properties object */


          return schemaMap;
     }

     /**
      * @function addInheritedProperties
      * @param {Array} inheritedClasses
      * @param {Array} layout
      * @description add properties inherited from generalization and composition
      * @memberof Component
      */
     addInheritedProperties(inheritedClasses, layout) {
          forEach(inheritedClasses, function (mClasses) {
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
                         let literals = [];
                         if (openAPI.isModelPackage()) {
                              literals = attrType.literals;
                         } else if (openAPI.isModelDiagram()) {
                              let enumView = utils.getViewFromCurrentDiagram(attrType);
                              if (enumView != null) {
                                   let literalViews = utils.getVisibleLiteralsView(enumView);
                                   let literals = [];
                                   forEach(literalViews, function (literalView) {
                                        literals.push(literalView.model);
                                   });
                              }
                         }
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
     }

     /**
      * @function getJSONSchema
      * @description Returns component object 
      * @returns {Object}
      * @memberof Component
      */
     getJSONLayout() {
          let _this = this;
          let layout = [];

          /* For Interface */
          let paths, interfaceRealalization;
          interfaceRealalization = utils.fetchUMLInterfaceRealization();
          if (openAPI.isModelPackage()) {
               paths = openAPI.getPaths();
          } else if (openAPI.isModelDiagram()) {
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
                    let inheritedIDs = [...new Set(allInheritedClasses.map(item => item._id))];
                    let inheritedClasses = [];
                    inheritedClasses.push(source);
                    forEach(inheritedIDs, function (id) {
                         let obj = app.repository.get(id);
                         inheritedClasses.push(obj);
                    });

                    this.addInheritedProperties(inheritedClasses, layout);

                    let views = dElement.getUMLAssociationView();
                    let dCompositionModel = [];
                    forEach(views, function (view) {
                         dCompositionModel.push(view.model);
                    });
                    let referenceClasses = [];
                    forEach(inheritedClasses, function (mClass) {

                         if (openAPI.isModelPackage()) {
                              let res = app.repository.select(mClass.name + "::@UMLAssociation");
                              forEach(res, function (assoc) {
                                   referenceClasses.push(assoc.end2.reference);
                              });
                         } else {

                              forEach(dCompositionModel, function (item) {
                                   if (mClass._id == item.end1.reference._id) {
                                        referenceClasses.push(item.end2.reference);
                                   }
                              });

                         }
                    });
                    let uniqueRefClasses = [];
                    forEach(referenceClasses, function (mClass) {
                         let res = uniqueRefClasses.filter(function (item) {
                              return item._id == mClass._id;
                         });
                         if (res.length == 0) {
                              uniqueRefClasses.push(mClass);
                         }
                    });
                    this.addInheritedProperties(uniqueRefClasses, layout);
               });
          });
          return layout;
     }

     /**
      * @function findAllInheritedClassesByGeneralization
      * @description find recursively inherited classes by generalization
      * @returns {Array} allInheritedClasses
      * @returns {UMLClass} target
      * @memberof Component
      */
     findAllInheritedClassesByGeneralization(allInheritedClasses, target) {
          let _this = this;
          let result = [];
          if (openAPI.isModelPackage()) {
               result = app.repository.select(target.name + '::@UMLGeneralization');
          } else {
               let views = dElement.getUMLGeneralizationView();
               forEach(views, function (item) {
                    if (target._id == item.model.source._id) {
                         result.push(item.model);
                    }
               });

          }

          forEach(result, function (item) {
               allInheritedClasses.push(item.target);
               _this.findAllInheritedClassesByGeneralization(allInheritedClasses, item.target)
          });
     }

     /**
      * @function removeDuplicatePropertyOfRefs
      * @description remove duplicate property of references
      * @returns {Array} allInheritedClasses
      * @returns {Object} mainPropertiesObj
      * @returns {UMLClass} objClass
      * @returns {Array} duplicateDeletedReference 
      * @memberof Component
      */
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

          /* Remove 'Ids' character from Schema name so we can delete it from duplicate property */
          let newUniqueArray = [];
          uniqueArray.forEach(function (item) {
               if (item.sName.endsWith("Ids")) {
                    item.sName = item.sName.replace('Ids', '');
               }
               newUniqueArray.push(item);
          });

          /* Remove duplicate property */
          newUniqueArray.forEach(function (comp) {
               if (mainPropertiesObj.hasOwnProperty(comp.sName)) {
                    delete mainPropertiesObj[comp.sName];

                    let objTemp = {};
                    objTemp[objClass.name] = comp
                    duplicateDeletedReference.push(objTemp);
               }
          });
     }

}

module.exports = Component;