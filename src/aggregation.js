const openAPI = require('./openapi');
const constant = require('./constant');
/**
 * @class Aggregation 
 * @description class returns the API Aggregation 
 */
class Aggregation {
     /**
      * @constructor Creates an instance of Aggregation.
      */
     constructor() {

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
                              console.log("attrIsID", attrIsID);
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
     addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName) {
          let propertiesObj = {};
          aggregationClasses.push(assoc.end2.reference);
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
               console.log("parentIDs", parentGeneralizationClassAttribute);
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
                              console.log("attrIsID", attrIsID);
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
               let jsonError = {
                    isWarning: true,
                    msg: "There is no \'isID\' Attribute in Target Class \'" + assoc.end2.reference.name + "\' which is referenced in the Source Class \'" + assoc.end1.reference.name + "\'"
               };
               openAPI.setError(jsonError);
          }
          /* Check and add multiplicity */
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {

               let itemsObj = {};
               propertiesObj.items = itemsObj;
               let allOfArray = [];
               itemsObj.allOf = allOfArray;

               let objAllOfArry = {};
               objAllOfArry['$ref'] = constant.getReference() + assoc.end2.reference.name + 'Ids';
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
               allOfObj['$ref'] = constant.getReference() + assoc.end2.reference.name + 'Ids';
               allOfArray.push(allOfObj);

               allOfObj = {};
               allOfObj['type'] = 'object';
               allOfArray.push(allOfObj);
          }
          return mainPropertiesObj;
     }
}

module.exports = Aggregation;