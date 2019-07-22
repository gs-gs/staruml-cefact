const openAPI =require('./openapi');
const constant =require('./constant');
/**
 *
 *
 * @class Aggregation
/**
 * Aggregation class returns the API Aggregation 
 *
 * @class Aggregation
 */
class Aggregation {
     /**
      * Creates an instance of Aggregation.
      * 
      * @constructor Aggregation
      */
     constructor() {
          
     }

     
     /**
      *
      *
      * @param {Object} mainPropertiesObj
      * @param {Array} aggregationClasses
      * @param {UMLAssociation} assoc
      * @returns mainPropertiesObj
      * @memberof Component
      */
     addAggregationProperties(mainPropertiesObj,aggregationClasses,assoc) {
          let propertiesObj={};
          aggregationClasses.push(assoc.end2.reference);
          mainPropertiesObj[assoc.name] = propertiesObj;

          let arrIsID=[];
          let filterClasses = aggregationClasses.filter(itemClass => {

               let filterAttributes = itemClass.attributes.filter(item => {

                    return item.isID==true;
               });

               if(filterAttributes.length>0){
                    arrIsID.push(filterAttributes);
               }
               
          });
          if(arrIsID.length==0){
               let jsonError={
                    isWarning:true,
                    msg:"There is no {isID} field defined in "+assoc.end2.reference.name+" property"
               };
               // app.dialogs.showErrorDialog("There is no {id} properties defined in Aggregation.");
               openAPI.setError(jsonError);
          }

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
               //AskQue
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