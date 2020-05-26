const nodeUtils = require('util');
const openAPI = require('./openapi');
const utils = require('./utils');
const constant = require('./constant');
/**
 * @class Aggregation 
 * @description class returns the API Aggregation 
 */
class Aggregation {
     /**
      * @constructor Creates an instance of Aggregation.
      */
     constructor(reqAttr) {
          this.arrAttRequired = reqAttr;
     }

     /**
      * @function findParentClassAggregationIsID
      * @description Function will check recursively for ownedElements UMLGeneralization of target class to check if target has isID property or not
      * @param {UMLClass} itemClass
      * @param {Array} parentGeneralizationClassAttribute
      * @memberof Aggregation
      */
     findParentClassAggregationIsID(itemClass, parentGeneralizationClassAttribute) {
          if (itemClass instanceof type.UMLClass) {
               itemClass.ownedElements.forEach(item => {
                    if (item instanceof type.UMLGeneralization) {
                         let generalizationSourceID = item.source._id;
                         if (itemClass._id == generalizationSourceID) {
                              let attrIsID = item.target.attributes.filter(attr => {
                                   return attr.isID && (attr.isID == true)
                              });
                              if (attrIsID.length > 0) {
                                   parentGeneralizationClassAttribute.push(attrIsID);
                              }
                              this.findParentClassAggregationIsID(item.target, parentGeneralizationClassAttribute);
                         }
                    }
                    /* else if(item instanceof type.UMLAssociation) {
                         if (item.end1.aggregation == constant.shared){
                              tAttArray.push(item.end2.reference);
                         }
                    } */
               });
          }
     }

     /**
      * @function addAggregationProperties
      * @description adds aggregation properties in mainPropertiesObj
      * @param {Object} mainPropertiesObj
      * @param {Array} aggregationClasses
      * @param {UMLAssociation} assoc
      * @returns {Object}
      * @memberof Aggregation
      */
     addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName, compositionRef) {
          let propertiesObj = {};
          let objAttrRe = {
               name: assocName,
               multiplicity: assoc.end2.multiplicity
          };
          aggregationClasses.push(assoc.end2.reference);
          this.arrAttRequired.push(objAttrRe);
          mainPropertiesObj[assocName] = propertiesObj;
          /* mainPropertiesObj[assoc.name] = propertiesObj; */

          let arrIsID = [];
          /* To check aggregation has isID attribute or not */
          let attrAssoc = assoc.end2.reference.attributes.filter(attr => {
               return attr.isID && (attr.isID == true)
          });
          if (attrAssoc.length > 0) {
               arrIsID.push(attrAssoc);
          }
          aggregationClasses.filter(itemClass => {
               /* This will store the attributes of target class of Generalization */
               let parentGeneralizationClassAttribute = [];
               this.findParentClassAggregationIsID(itemClass, parentGeneralizationClassAttribute);
               /* Check and add if there any isID attributes of parent Class  */
               /* itemClass.ownedElements.forEach(item => {

                    if (item instanceof type.UMLGeneralization) {
                         let generalizationSourceID = item.source._id;
                         if (itemClass._id == generalizationSourceID) {


                              let attrIsID = item.target.attributes.filter(attr => {
                                   return attr.isID && (attr.isID == true)
                              });
                              if (attrIsID.length > 0) {
                                   tAttArray.push(item);
                              }
                         }
                    }

               }); */

               if (parentGeneralizationClassAttribute.length > 0) {
                    arrIsID.push(parentGeneralizationClassAttribute);
               }
               let filterAttributes = [];
               if (openAPI.isModelPackage()) {

                    filterAttributes = itemClass.attributes.filter(item => {

                         return item.isID == true;
                    });
               } else if (openAPI.isModelDiagram()) {
                    if (assoc.end2.reference._id == itemClass._id) {

                         filterAttributes = itemClass.attributes.filter(item => {

                              return item.isID == true;
                         });
                    }
               }


               if (filterAttributes.length > 0) {
                    arrIsID.push(filterAttributes);
               }

          });
          /* If no isID attribute found in Aggregation, Will be prompt error to user. */
          if (arrIsID.length == 0) {
               let strMsg = nodeUtils.format(constant.STR_ISID_MSG, assoc.end2.reference.name, assoc.end1.reference.name);
               let jsonError = {
                    isWarning: true,
                    msg: strMsg
               };
               openAPI.setError(jsonError);
          }
          let ref = '';
          let sName = '';
          /* Check and add multiplicity */
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {

               let itemsObj = {};
               propertiesObj.items = itemsObj;
               let allOfArray = [];
               itemsObj.allOf = allOfArray;

               let objAllOfArry = {};
               sName = utils.upperCamelCase(assoc.end2.reference.name + 'Ids');
               ref = constant.getReference() + sName;
               objAllOfArry['$ref'] = ref;
               allOfArray.push(objAllOfArry);

               objAllOfArry = {};
               objAllOfArry['type'] = 'object';
               allOfArray.push(objAllOfArry);

               propertiesObj.type = 'array';
               if (assoc.end2.multiplicity == "1..*") {
                    propertiesObj.minItems = 1;
               }
          } else {
               /* Add reference of Schema */
               let allOfArray = [];
               propertiesObj.allOf = allOfArray;


               let allOfObj = {};
               sName = utils.upperCamelCase(assoc.end2.reference.name + 'Ids');
               ref = constant.getReference() + sName;
               allOfObj['$ref'] = ref;
               allOfArray.push(allOfObj);

               allOfObj = {};
               allOfObj['type'] = 'object';
               allOfArray.push(allOfObj);
          }
          let temp = {};
          temp['ref'] = propertiesObj;
          temp['sName'] = sName
          /* compositionRef.push('1. aggregation : '+ref,temp); */
          compositionRef.push(temp);
          return mainPropertiesObj;
     }
}

module.exports = Aggregation;