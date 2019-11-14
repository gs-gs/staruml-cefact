const Utils = require('./utils');
const Generalization = require('./generalization');
const Properties = require('./properties');
const Association = require('./association');
const Aggregation = require('./aggregation');
const Composition = require('./composition');
const Required = require('./required');
const openAPI = require('./openapi');
const constant = require('./constant');
const diagramEle = require('./diagram/diagramElement');

/**
 * @class Component 
 * @description class adds all classes from the class diagram
 */
class Component {
     /**
      *Creates an instance of Component.
      * @param {string} fullPath
      * @memberof Component
      */
     constructor() {
          this.mainComponentObj = {};
          this.mainSchemaObj = {};
          this.utils = new Utils();
          this.arrAttr = [];
          /* this.arrAssoc = []; */
          this.required = new Required();
          this.generalization = new Generalization();
          this.association = new Association();
     }

     /**
      * @function getComponent
      * @description Returns component object 
      * @returns {Object}
      * @memberof Component
      */
     getComponent() {
          let classes, classLink;
          if (openAPI.isModelPackage()) {
               classes = openAPI.getClasses();
               classLink = app.repository.select("@UMLAssociationClassLink");
          } else if (openAPI.isModelDiagram()) {
               classes = diagramEle.getUMLClass();
               classLink = diagramEle.getUMLAssociationClassLink();
          }
          let arrIdClasses = [];
          let flagNoName = false;
          let noNameRel = [];
          this.mainComponentObj.schemas = this.mainSchemaObj;
          this.duplicatePropertyError = [];
          classes.forEach(objClass => {
               let mainClassesObj = {};
               let mainPropertiesObj = {};

               let accosElems = objClass.ownedElements.filter(item => {
                    return item instanceof type.UMLAssociation;
               });

               let assocSideClassLink = classLink.filter(item => {
                    return item.associationSide.end2.reference._id == objClass._id;
               });

               let assocClassLink = classLink.filter(item => {
                    return item.associationSide.end1.reference._id == objClass._id;
               });

               this.mainSchemaObj[objClass.name] = mainClassesObj

               mainClassesObj.type = 'object';

               /* Adding Properties */
               let properties = new Properties(objClass, assocSideClassLink);
               /* Adds Attributes, With Enum, With Multiplicity */
               mainPropertiesObj = properties.addProperties();
               mainClassesObj.properties = mainPropertiesObj;



               this.arrAttr = properties.getAttributes();


               /* Adding Association Class Link Properties : Adds Attributes with Multiplicity, without Multiplicity */
               mainPropertiesObj = this.association.addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj);

               /* this.arrAssoc = this.association.getAssociations();
               console.log("arrAssoc",this.arrAssoc); */

               let arrGeneral = this.generalization.findGeneralizationOfClass(objClass);
               let aggregationClasses = [];
               let classAssociations = this.association.getAssociationOfClass(objClass);


               console.log("classAssociations", classAssociations);
               console.log("mainPropertiesObj", mainPropertiesObj);


               classAssociations.forEach(assoc => {
                    if (assoc instanceof type.UMLAssociation) {
                         /* let filterAssoc = this.arrAssoc.filter(item => {
                              return item.name == assoc.name;
                         }); */
                         /* 
                                                  console.log("filterAssoc",filterAssoc);
                                                  if (filterAssoc.length == 0 && assoc.name != "") {
                          */


                         let assocName = assoc.name;
                         if (assocName == '') {
                              assocName = assoc.end2.reference.name;
                         }

                         /* Check for duplicate property */
                         let propKeys = Object.keys(mainPropertiesObj);
                         propKeys.forEach(prop => {
                              if (assocName == prop) {
                                   let error = "There is duplicate property in class \'" + assoc.end1.reference.name + "\' and property name is \'" + prop + "\'";
                                   this.duplicatePropertyError.push(error);
                                   let jsonError = {
                                        isDuplicateProp: true,
                                        msg: this.duplicatePropertyError
                                   };
                                   openAPI.setError(jsonError);
                              }
                         });
                         /* for(let prop in propKeys){
                              if(assocName==prop){
                                   let jsonError = {
                                        isDuplicateProp: true,
                                        msg: "There is duplicate property in class \'"+assoc.end1.reference.name+"\' named \'"+prop+"\'"
                                   };
                                   openAPI.setError(jsonError);
                              }
                         } */

                         if (assoc.end1.aggregation == constant.shared) {
                              /* Adding Aggregation : Adds Attributes with Multiplicity, without Multiplicity */
                              let aggregation = new Aggregation();
                              console.log("Classname", objClass.name);
                              mainPropertiesObj = aggregation.addAggregationProperties(mainPropertiesObj, aggregationClasses, assoc, assocName);

                         } else {
                              /* Adding composition : Adds Attributes with Multiplicity, without Multiplicity */
                              let composition = new Composition();
                              mainPropertiesObj = composition.addComposition(mainPropertiesObj, assoc, assocName);

                         }
                         /* 
                                                       this.arrAssoc.push(assoc);
                                                  } else {
                                                       if (assoc.name == "") {
                                                            flagNoName = true;
                                                            let str = assoc.end1.reference.name + "-" + assoc.end2.reference.name;
                                                            noNameRel.push(str);
                                                       }
                                                  } */
                    } else if (assoc instanceof type.UMLGeneralization) {
                         arrGeneral.push(assoc);
                    }
               });

               /* Adding Generalization : Adds refs of Class in 'allOf' object */
               mainClassesObj = this.generalization.addGeneralization(arrGeneral, mainClassesObj);


               let filterAttributes = this.arrAttr.filter(item => {
                    return item.isID;
               });

               /* Generate Ids Class if needed */
               if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                    let allOfArray = [];
                    mainClassesObj.allOf = allOfArray;
                    let allOfObj = {};
                    allOfObj['$ref'] = constant.getReference() + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj = {};
                    allOfObj['type'] = 'object';
                    allOfArray.push(allOfObj);

               }

               /* Adding Required */
               if (this.required.getRequiredAttributes(this.arrAttr).length > 0) {
                    mainClassesObj.required = this.required.addRequiredAttributes(this.arrAttr);
               }

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (assocSideClassLink.length > 0) {
                    aggregationClasses.push(objClass);
               }

               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });

                    if (filter.length == 0) {
                         this.association.writeAssociationProperties(mainClassesObj, itemClass, this.mainSchemaObj);
                         arrIdClasses.push(itemClass)
                    }
               });
          });

          return this.mainComponentObj;
     }

}

module.exports = Component;