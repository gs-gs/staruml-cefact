const openAPI = require('./openapi');
const constant = require('./constant');
/**
 *
 *
 * @class Generalization
/**
 * Generalization class returns the API Generalization 
 *
 * @class Generalization
 */
class Generalization {
     /**
      * Creates an instance of Generalization.
      * 
      * @constructor Generalization
      */
     constructor() {

     }


     /**
      *
      * @param {Array} arrGeneral
      * @param {Object} mainClassesObj
      * @returns
      * @memberof Component
      */
     addGeneralization(arrGeneral, mainClassesObj) {
          /**
           * Add Generalization class
           * Inherite all properties of parent class
           */
          if (arrGeneral.length > 0) {
               console.log("---WG-1")
               let allOfArray = [];
               mainClassesObj.allOf = allOfArray;
               arrGeneral.forEach(generalizeClass => {
                    let allOfObj = {};
                    allOfObj['$ref'] = constant.getReference() + generalizeClass.target.name;
                    allOfArray.push(allOfObj);


                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);
               });

          }

          return mainClassesObj;
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
}

module.exports = Generalization;