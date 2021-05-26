const utils = require('./utils');
const constant = require('./constant');
var forEach = require('async-foreach').forEach;
const openAPI = require('../src/openapi');
/**
 * @description class returns the Attributes available in class  
 * @class Properties
 */
class Properties {

     /**
      * @constructor Creates an instance of Properties.
      */
     constructor(objClass, assocSideClassLink) {
          this.objClass = objClass;
          this.assocSideClassLink = assocSideClassLink;
          this.arrAttRequired = [];
          this.enumerations = [];
          this.dataTypes = [];
          utils.resetErrorBlock();
     }

     /**
      * @function getAttributes
      * @description Returns the array of properties
      * @returns {Array}
      * @memberof Properties
      */
     getAttributes() {
          return this.arrAttRequired;
     }

     /**
      * @function getEnumerations
      * @description Returns the array of enumerations used as data types by properties
      * @returns {Array}
      * @memberof Properties
      */
     getEnumerations() {
          return this.enumerations;
     }

     /**
      * @function getDataTypes
      * @description Returns the array of enumerations used as data types by properties
      * @returns {Array}
      * @memberof Properties
      */
     getDataTypes() {
          return this.dataTypes;
     }

     /**
      * @function addProperties
      * @description Adds properties to mainPropertiesObject
      * @memberof Properties
      */
     addProperties() {
          let mainPropertiesObj = {};
          let _this = this;
          if (openAPI.isModelDiagram()) {
               _this.arrAttRequired = [];
               let propertiesObj = {};
               let attributesView = utils.getVisibleAttributeView(this.objClass);
               forEach(attributesView, function (attrView) {
                    let attribute = attrView.model;
                    propertiesObj = {};
                    let filterAttr = _this.arrAttRequired.filter(item => {
                         return item.name == attribute.name;
                    });

                    /* Filter for visible attribute Views from diagram elements (Class & Interface) */
                    _this.addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute);

               });
          } else {

               _this.arrAttRequired = [];
               let propertiesObj = {};
               let attributes = this.objClass.attributes;
               forEach(attributes, function (attribute) {

                    propertiesObj = {};
                    let filterAttr = _this.arrAttRequired.filter(item => {
                         return utils.lowerCamelCase(item.name) == utils.lowerCamelCase(attribute.name);
                    });

                    /* Filter for visible attribute Views from diagram elements (Class & Interface) */
                    _this.addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute);

               });
          }
          return mainPropertiesObj;
     }

     /**
      * @function addPropertiesForAttrTypeRefClass
      * @description Adds properties for those classes whose attribute type is reference class
      * @returns {Object} mainPropertiesObj
      * @memberof Properties
      */
     addPropertiesForAttrTypeRefClass() {
          let mainPropertiesObj = {};
          let _this = this;
          _this.arrAttRequired = [];
          let propertiesObj = {};
          let attributes = this.objClass.attributes;
          forEach(attributes, function (attribute) {

               propertiesObj = {};
               let filterAttr = _this.arrAttRequired.filter(item => {
                    return item.name == attribute.name;
               });

               /* Filter for visible attribute Views from diagram elements (Class & Interface) */
               _this.addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute);

          });
          return mainPropertiesObj;
     }
     /**
      * @function addPropData
      * @description Adds property data like multiplicity, attribute type etc to mainPropertiesObject
      * @param {Array} filterAttr
      * @param {Object} mainPropertiesObj
      * @param {Object} propertiesObj
      * @param {UMLAttribute} attribute
      * @memberof Properties
      */
     addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute) {
          let _this = this;
          let aclAssoSideArr = [];
          if (openAPI.isModelDiagram()) {
               forEach(_this.assocSideClassLink, function (aclView) {
                    aclAssoSideArr.push(aclView.model);
               });
          } else {
               aclAssoSideArr = _this.assocSideClassLink;
          }
          if (filterAttr.length == 0) {
               _this.arrAttRequired.push(attribute);

               if (aclAssoSideArr.length > 0 && attribute.isID) {
                    console.log("Skipped classlink : " + _this.objClass.name + " : " + attribute.name);
               } else {

                    /* if(!attribute.isID ){ */
                    mainPropertiesObj[utils.lowerCamelCase(attribute.name)] = propertiesObj;
                    /* Add Multiplicity */
                    if (attribute.multiplicity === "1..*" || attribute.multiplicity === "0..*") {
                         let itemsObj = {};
                         propertiesObj.items = itemsObj;
                         itemsObj.description = (attribute.documentation ? utils.buildDescription(attribute.documentation) : constant.STR_MISSING_DESCRIPTION);

                         utils.addAttributeType(itemsObj, attribute);

                         propertiesObj.type = 'array';
                         /**
                          * Add MinItems of multiplicity is 1..*
                          */
                         if (attribute.multiplicity === "1..*") {
                              propertiesObj.minItems = 1;
                         }

                         if(attribute.isReadOnly) {
                              propertiesObj.readOnly = true;
                         }
                    } else {
                         /**
                          * If data type is enumeration, build allOf object with a reference to a corresponding schema
                          */
                         if (attribute.type instanceof type.UMLEnumeration) {
                              let allOfArr = [];
                              let descriptionObj = {};
                              let refObj = {};
                              descriptionObj['description'] = attribute.documentation ? utils.buildDescription(attribute.documentation) : constant.STR_MISSING_DESCRIPTION;
                              refObj['$ref'] = constant.getReference() + utils.upperCamelCase(attribute.type.name);
                              _this.enumerations.push(attribute.type);
                              allOfArr.push(descriptionObj);
                              allOfArr.push(refObj);
                              propertiesObj['allOf'] = allOfArr;
                         } else if (attribute.type instanceof type.UMLDataType) {
                              let attributeTypeString = attribute['name'];
                              let result = utils.getJsonRuleType().filter(function (rule) {
                                   return rule.key.toLowerCase() === attributeTypeString.toLowerCase();
                              });
                              if(result!=null){
                                   propertiesObj.description = (attribute.documentation ? utils.buildDescription(attribute.documentation) : constant.STR_MISSING_DESCRIPTION);
                                   if(attribute.isReadOnly) {
                                        propertiesObj.readOnly = true;
                                   }
                                   utils.addAttributeType(propertiesObj, attribute);
                              } else {
                                   let allOfArr = [];
                                   let descriptionObj = {};
                                   let refObj = {};
                                   descriptionObj['description'] = attribute.documentation ? utils.buildDescription(attribute.documentation) : constant.STR_MISSING_DESCRIPTION;
                                   refObj['$ref'] = constant.getReference() + utils.upperCamelCase(attribute.type.name);
                                   _this.dataTypes.push(attribute.type);
                                   allOfArr.push(descriptionObj);
                                   allOfArr.push(refObj);
                                   propertiesObj['allOf'] = allOfArr;
                              }
                         } else {
                              propertiesObj.description = (attribute.documentation ? utils.buildDescription(attribute.documentation) : constant.STR_MISSING_DESCRIPTION);
                              if(attribute.isReadOnly) {
                                   propertiesObj.readOnly = true;
                              }
                              utils.addAttributeType(propertiesObj, attribute);
                         }
                    }
                    if (attribute.defaultValue != "") {
                         /* Add default field */
                         propertiesObj.example = attribute.defaultValue;
                    }
                    /* } */

               }
          }
     }

}

module.exports = Properties;