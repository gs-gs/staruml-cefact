const forEach = require('async-foreach').forEach;
const openAPI = require('./openapi');
const constant = require('./constant');
const utils = require('./utils');
const dElement = require('./diagram/dElement');

/**
 * @class Generalization 
 * @description class returns the API Generalization 
 */
class Generalization {
     /**
      * @constructor Creates an instance of Generalization.
      */
     constructor() {
          utils.resetErrorBlock();
     }


     /**
      * @function addGeneralization
      * @description add Generalization in mainClassesObj
      * @param {Array} arrGeneral
      * @param {Object} mainClassesObj
      * @returns {Object}
      * @memberof Generalization
      */
     addGeneralization(arrGeneral, mainClassesObj, compositionRef) {
          /**
           * Add Generalization class
           * Inherite all properties of parent class
           */
          if (arrGeneral.length > 0) {
               let allOfArray = [];
               mainClassesObj.allOf = allOfArray;
               arrGeneral.forEach(generalizeClass => {
                    let allOfObj = {};
                    let sName = '';
                    sName = generalizeClass.target.name;
                    let ref = constant.getReference() + sName;
                    allOfObj['$ref'] = ref;
                    allOfArray.push(allOfObj);


                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);

                    let temp = {};
                    temp['ref'] = mainClassesObj;
                    temp['sName'] = sName;
                    // compositionRef.push('7. generalization : '+ref,temp);
                    compositionRef.push(temp);
               });

          }

          return mainClassesObj;
     }

     /**
      * @function findGeneralizationRecursivelyOfClass
      * @description Function will check recursively for ownedElements UMLGeneralization of target class to check if target has isID property or not
      * @param {UMLClass} itemClass
      * @param {Array} parentGeneralizationClassAttribute
      * @memberof Aggregation
      */
     findGeneralizationRecursivelyOfClass(itemClass, parentGeneralizationClassAttribute) {
          if (itemClass instanceof type.UMLClass) {
               itemClass.ownedElements.forEach(item => {
                    if (item instanceof type.UMLGeneralization) {


                         let generalizationSourceID = item.source._id;
                         if (itemClass._id == generalizationSourceID) {
                              parentGeneralizationClassAttribute.push(item);
                              this.findGeneralizationRecursivelyOfClass(item.target, parentGeneralizationClassAttribute);
                         }
                    }

               });
          }
          console.log("Generalization classes", parentGeneralizationClassAttribute);
     }

     /**
      * @function findGeneralizationOfClass
      * @description Find all generalization of UMLClass
      * @param {UMLClass} objClass 
      * @memberof Generalization
      */
     findGeneralizationOfClass(objClass) {
          try {

               let filterGeneral = null;
               if (openAPI.isModelPackage()) {

                    let generalizeClasses = app.repository.select(openAPI.getExportElementName() + "::" + objClass.name + "::@UMLGeneralization");
                    //  let generalizeClasses = app.repository.select("@UMLGeneralization");
                    filterGeneral = generalizeClasses.filter(item => {
                         return item.source._id == objClass._id
                    });

               } else if (openAPI.isModelDiagram()) {
                    let generalizeClassesViews = dElement.getUMLGeneralizationView();

                    let generalizeClasses=[];
                    forEach(generalizeClassesViews,function(generalizationView){
                         generalizeClasses.push(generalizationView.model);
                    });

                    filterGeneral = generalizeClasses.filter(item => {
                         return item.source._id == objClass._id
                    });
                    /* let generalizeClasses = app.repository.select("tempPkg::" + objClass.name + "::@UMLGeneralization");
                    filterGeneral=generalizeClasses; */


               }


               return filterGeneral;
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }
     }
}

module.exports = Generalization;