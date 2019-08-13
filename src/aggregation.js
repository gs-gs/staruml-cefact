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
      * @function addAggregationProperties
      * @description adds aggregation properties in mainPropertiesObj
      * @param {Object} mainPropertiesObj
      * @param {Array} aggregationClasses
      * @param {UMLAssociation} assoc
      * @returns {Object}
      * @memberof Aggregation
      */
     addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc) {
          let propertiesObj = {};
          aggregationClasses.push(assoc.end2.reference);
          mainPropertiesObj[assoc.name] = propertiesObj;

          let arrIsID = [];
          let filterClasses = aggregationClasses.filter(itemClass => {

               let filterAttributes = itemClass.attributes.filter(item => {

                    return item.isID == true;
               });

               if (filterAttributes.length > 0) {
                    arrIsID.push(filterAttributes);
               }

          });
          if (arrIsID.length == 0) {
               let jsonError = {
                    isWarning: true,
                    msg: "There is no \"isID\" Attribute in Target Class \"" + assoc.end2.reference.name + "\" which is referenced in the Source Class \"" + assoc.end1.reference.name + "\""
               };
               openAPI.setError(jsonError);
          }
          // Check and add multiplicity
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
               // Add reference of Schema
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