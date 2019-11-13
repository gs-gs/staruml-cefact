const openAPI = require('../openapi');
const constant = require('../constant');
const Utils = require ('../utils');
var diagramEle = require('../diagram/diagramElement');

/**
 * @class GeneralizationDiagram 
 * @description class returns the API Generalization from UMLClassDiagram
 */
class GeneralizationDiagram {
     /**
      * @constructor Creates an instance of GeneralizationDiagram.
      */
     constructor() {
          this.utils=new Utils();
     }


     /**
      * @function addGeneralization
      * @description add Generalization in mainClassesObj from UMLClassDiagram
      * @param {Array} arrGeneral
      * @param {Object} mainClassesObj
      * @returns {Object}
      * @memberof GeneralizationDiagram
      */
     addGeneralization(arrGeneral, mainClassesObj) {
          /**
           * Add GeneralizationDiagram class
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
          console.log("GeneralizationDiagram classes", parentGeneralizationClassAttribute);
     }
     /**
      * @function findGeneralizationOfClass
      * @description Find all Generalization of UMLClass from UMLClassDiagram
      * @param {UMLClass} objClass 
      * @memberof GeneralizationDiagram
      */
     findGeneralizationOfClass(objClass) {
          try {

               let filterGeneral=null;
               if(openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE){
                    
                    let generalizeClasses = app.repository.select(openAPI.getUMLPackage().name + "::" + objClass.name + "::@UMLGeneralization");
                    //  let generalizeClasses = app.repository.select("@UMLGeneralization");
                    filterGeneral = generalizeClasses.filter(item => {
                         return item.source._id == objClass._id
                    });
                    
               }else if(openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM){
                    let generalizeClasses = diagramEle.getUMLGeneralization();;
                    filterGeneral = generalizeClasses.filter(item => {
                         return item.source._id == objClass._id
                    });

               }

               
               return filterGeneral;
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = GeneralizationDiagram;