const Utils = require('./utils');
var forEach = require('async-foreach').forEach;
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
          this.arrAttr = [];
          this.utils = new Utils();
     }

     /**
      * @function getAttributes
      * @description Returns the array of properties
      * @returns {Array}
      * @memberof Properties
      */
     getAttributes() {
          return this.arrAttr;
     }

     /**
      * @function addProperties
      * @description Adds properties to mainPropertiesObject
      * @memberof Properties
      */
     addProperties() {
          let mainPropertiesObj = {};
          let _this=this;
          _this.arrAttr=[];
          let propertiesObj = {};
          let attributes = this.objClass.attributes;
          forEach(attributes, function (attribute) {
               
               propertiesObj = {};
               let filterAttr = _this.arrAttr.filter(item => {
                    return item.name == attribute.name;
               });
               if (filterAttr.length == 0) {
                    _this.arrAttr.push(attribute);
                    if (_this.assocSideClassLink.length > 0 && attribute.isID) {
                         console.log("Skipped classlink : "+_this.objClass.name+" : "+attribute.name);
                    } else {

                         /* if(!attribute.isID ){ */
                         mainPropertiesObj[attribute.name] = propertiesObj;
                         /* Add Multiplicity */
                         if (attribute.multiplicity === "1..*" || attribute.multiplicity === "0..*") {
                              let itemsObj = {};
                              propertiesObj.items = itemsObj;
                              itemsObj.description = (attribute.documentation ? _this.utils.buildDescription(attribute.documentation) : "missing description");

                              // itemsObj.type = _this.utils.getType(attribute.type);
                              _this.utils.addAttributeType(itemsObj, attribute);

                              propertiesObj.type = 'array';
                              /**
                               * Add MinItems of multiplicity is 1..*
                               */
                              if (attribute.multiplicity === "1..*") {
                                   propertiesObj.minItems = 1;
                              }
                         } else {
                              propertiesObj.description = (attribute.documentation ? _this.utils.buildDescription(attribute.documentation) : "missing description");

                              // propertiesObj.type = _this.utils.getType(attribute.type);
                              _this.utils.addAttributeType(propertiesObj, attribute);

                              if (attribute.type instanceof type.UMLEnumeration) {
                                   /* Add Enumeration */
                                   propertiesObj.enum = _this.utils.getEnumerationLiteral(attribute.type);
                              }
                         }
                         if (attribute.defaultValue != "") {
                              /* Add default field */
                              propertiesObj.default = attribute.defaultValue;
                         }
                         /* } */

                    }
               }
          });
          return mainPropertiesObj;
     }


}

module.exports = Properties;