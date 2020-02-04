const utils = require('./utils');
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
          utils.resetErrorBlock();
     }

     /**
      * @function getAttributes
      * @description Returns the array of properties
      * @returns {Array}
      * @memberof Properties
      */
     getRequiredAttributes() {
          return this.arrAttRequired;
     }

     /**
      * @function addProperties
      * @description Adds properties to mainPropertiesObject
      * @memberof Properties
      */
     addProperties() {
          let mainPropertiesObj = {};
          let _this = this;
          if(openAPI.isModelDiagram()){
               _this.arrAttRequired = [];
               let propertiesObj = {};
               let attributesView = utils.getVisibleAttributeView(this.objClass);
               forEach(attributesView, function (attrView) {
                    let attribute=attrView.model;
                    propertiesObj = {};
                    let filterAttr = _this.arrAttRequired.filter(item => {
                         return item.name == attribute.name;
                    });
                    
                    /* Filter for visible attribute Views from diagram elements (Class & Interface) */
                    _this.addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute);
                    
               });
          }else{

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
          }
          return mainPropertiesObj;
     }
     addPropData(filterAttr, mainPropertiesObj, propertiesObj, attribute) {
          let _this = this;
          let aclAssoSideArr=[];
          if(openAPI.isModelDiagram()){
               forEach(_this.assocSideClassLink,function(aclView){
                    aclAssoSideArr.push(aclView.model);
               });
          }
          else{
               aclAssoSideArr=_this.assocSideClassLink;
          }
          if (filterAttr.length == 0) {
               _this.arrAttRequired.push(attribute);

               if (aclAssoSideArr.length > 0 && attribute.isID) {
                    console.log("Skipped classlink : " + _this.objClass.name + " : " + attribute.name);
               } else {

                    /* if(!attribute.isID ){ */
                    mainPropertiesObj[attribute.name] = propertiesObj;
                    /* Add Multiplicity */
                    if (attribute.multiplicity === "1..*" || attribute.multiplicity === "0..*") {
                         let itemsObj = {};
                         propertiesObj.items = itemsObj;
                         itemsObj.description = (attribute.documentation ? utils.buildDescription(attribute.documentation) : "missing description");

                         utils.addAttributeType(itemsObj, attribute);

                         propertiesObj.type = 'array';
                         /**
                          * Add MinItems of multiplicity is 1..*
                          */
                         if (attribute.multiplicity === "1..*") {
                              propertiesObj.minItems = 1;
                         }
                    } else {
                         propertiesObj.description = (attribute.documentation ? utils.buildDescription(attribute.documentation) : "missing description");

                         utils.addAttributeType(propertiesObj, attribute);

                         if (attribute.type instanceof type.UMLEnumeration) {
                              /* Add Enumeration */
                              propertiesObj.enum = utils.getEnumerationLiteral(attribute.type);
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