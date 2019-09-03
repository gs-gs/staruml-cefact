const openAPI = require('./openapi');
const constant = require('./constant');

/**
 * @class Generalization 
 * @description class returns the API Generalization 
 */
class Generalization {
     /**
      * @constructor Creates an instance of Generalization.
      */
     constructor() {

     }


     /**
      * @function addGeneralization
      * @description add Generalization in mainClassesObj
      * @param {Array} arrGeneral
      * @param {Object} mainClassesObj
      * @returns {Object}
      * @memberof Generalization
      */
     addGeneralization(arrGeneral, mainClassesObj) {
          /**
           * Add Generalization class
           * Inherite all properties of parent class
           */
          if (arrGeneral.length > 0) {
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
      * @memberof Generalization
      */
     findGeneralizationOfClass(objClass) {
          try {
               let generalizeClasses = app.repository.select(openAPI.getUMLPackage().name + "::" + objClass.name + "::@UMLGeneralization");
               // let generalizeClasses = app.repository.select("@UMLGeneralization");
               let filterGeneral = generalizeClasses.filter(item => {
                    return item.source._id == objClass._id
               });
               return filterGeneral;
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
     }

     /* async findGeneralizationOfClass(objClass) {
          return new Promise((resolve, reject) => {
               try {
                    // let generalizeClasses = app.repository.select("@UMLGeneralization");
                    console.log("--gen-start");
                    let generaCurrentPkg = await openAPI.getUMLGeneralization();
                    console.log("--gen-end");
                    let filterGeneral = generaCurrentPkg.filter(item => {
                         return item.source._id == objClass._id
                    });
                    resolve(filterGeneral);
               } catch (error) {
                    console.error("Found error", error.message);
                    reject(error);
                    this.writeErrorToFile(error);
               }
          });
          
     } */
}

module.exports = Generalization;