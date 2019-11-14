const Utils = require('./utils');
const Generalization = require('./generalization');
const Required = require('./required');
const constant = require('./constant');
const openAPI = require('./openapi');
const diagramEle = require('./diagram/diagramElement');
/**
 * @class Association
 * @description class returns the API Association 
 */
class Association {
     /**
      * @constructor Creates an instance of Association.
      */
     constructor() {
          this.utils = new Utils();
          this.arrAssoc = [];
          this.required = new Required();
     }

     /**
      * @function getAssociations
      * @description returns the array of Associations
      * @returns
      * @memberof Association
      */
     getAssociations() {
          return this.arrAssoc;
     }
     /**
      * @function addAssociationClassLinkProperties
      * @description Returns the association properties object 
      * @param {*} assocClassLink
      * @param {*} mainPropertiesObj
      * @returns
      * @memberof Association
      */
     addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj) {

          if (assocClassLink.length > 0) {
               assocClassLink.forEach(item => {
                    this.writeAssociationClassProperties(mainPropertiesObj, item);
                    this.arrAssoc.push(item.classSide);
               })
          }
          return mainPropertiesObj;
     }
     /**
      * @function writeAssociationClassProperties
      * @description adds property for association class
      * @param {Object} main properties json object
      * @param {UMLAssociationClassLink} associationClass 
      */
     writeAssociationClassProperties(mainPropertiesObj, associationClass) {
          let propertiesObj = {};


          if (associationClass != null && associationClass.classSide != null && associationClass.associationSide != null) {
               mainPropertiesObj[associationClass.classSide.name] = propertiesObj;
               let associationSide = associationClass.associationSide;
               let end2 = associationClass.associationSide.end2;
               let multiplicity = associationClass.associationSide.end2.multiplicity;


               /* Check and add multiplicity */
               if (multiplicity == "0..*" || multiplicity == "1..*") {
                    let itemsObj = {};
                    propertiesObj.items = itemsObj;
                    let allOfArray = [];
                    itemsObj.allOf = allOfArray;

                    let objAllOfArry = {};
                    if (associationSide.end1.aggregation == constant.shared) {
                         objAllOfArry['$ref'] = constant.getReference() + associationSide.end2.reference.name + 'Ids';
                    } else {
                         objAllOfArry['$ref'] = constant.getReference() + associationSide.end2.reference.name;
                    }

                    allOfArray.push(objAllOfArry);

                    objAllOfArry = {};
                    objAllOfArry['$ref'] = constant.getReference() + associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry = {};
                    objAllOfArry['type'] = 'object';
                    allOfArray.push(objAllOfArry);



                    propertiesObj.type = 'array';
                    if (associationSide.end2.multiplicity == "1..*") {
                         propertiesObj.minItems = 1;
                    }

               } else {
                    /* Add reference of Schema */
                    let allOfArray = [];
                    let objAllOfArry = {};
                    propertiesObj.allOf = allOfArray;

                    if (associationSide.end1.aggregation == constant.shared) {
                         objAllOfArry['$ref'] = constant.getReference() + associationSide.end2.reference.name + 'Ids';
                    } else {
                         objAllOfArry['$ref'] = constant.getReference() + associationSide.end2.reference.name;
                    }
                    allOfArray.push(objAllOfArry);

                    objAllOfArry = {};
                    objAllOfArry['$ref'] = constant.getReference() + associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry = {};
                    objAllOfArry['type'] = 'object';
                    allOfArray.push(objAllOfArry);

               }


          }

     }
     /**
      * @function getAssociationOfClass
      * @description Find all association of UMLClass
      * @param {UMLClass} objClass 
      */
     getAssociationOfClass(objClass) {
          try {
               /* Find the all UMLAssociation of project */

               /* Filter association whose end1 (Source) Class is current class */

               let filterAssociation = [];
               let filter = [];
               if (openAPI.isModelPackage()) {

                    let associations = app.repository.select("@UMLAssociation");
                    filterAssociation = associations.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    /* Filter association who is belong to current package */
                    filter = filterAssociation.filter(item => {
                         let parent = item.end1.reference._parent;
                         return (parent && parent instanceof type.UMLPackage && parent.name == openAPI.getUMLPackage().name);
                    });

               } else if (openAPI.isModelDiagram()) {
                    let dAssociation = null;
                    dAssociation = diagramEle.getUMLAssociation();
                    filterAssociation = dAssociation.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    /* Filter association who is belong to current package */
                    console.log("diagramAsso", diagramEle.getUMLAssociation());
                    filter = filterAssociation;
                    /* filterAssociation.filter(item => {
                                             let parent=item.end1.reference._parent;
                                             return (parent && parent instanceof type.UMLPackage);// && parent.name == openAPI.getUMLPackage().name);
                                        }); */
               }

               return filter;




          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }


     /* TODO : Do not remove getAssociationOfClass function. The function is in progress for experiment 
     getAssociationOfClass(objClass) {
          return new Promise((resolve, reject) => {


               try {
                    let associations = app.repository.select(openAPI.getUMLPackage().name + "::" + objClass.name + "::@UMLAssociation");
                    let filterAssociation = associations.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    let arrASS = openAPI.getPackageWiseUMLAssociation();
                    console.log("arr-assso--", arrASS);

                    resolve(filterAssociation);
               } catch (error) {
                    console.error("Found error", error.message);
                    this.utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     } */

     /**
      * @function writeAssociationProperties
      * @description 
      * @param {Object} Main open api json object 
      * @param {UMLClass} assciation 
      */
     writeAssociationProperties(mainClassesObj, assciation, mainSchemaObj) {
          try {
               let tempClass;
               if (assciation instanceof type.UMLAssociation) {
                    tempClass = assciation.end2.reference;

               } else {
                    tempClass = assciation;
               }

               let generalization = new Generalization();
               // let generalizeClasses = generalization.findGeneralizationOfClass(tempClass);
               let generalizeClasses = [];
               generalization.findGeneralizationRecursivelyOfClass(tempClass, generalizeClasses);

               let filterAttributes = tempClass.attributes.filter(item => {
                    return item.isID;
               });

               generalizeClasses.forEach(genClass => {
                    let genClassAttr = genClass.target.attributes.filter(item => {
                         return item.isID;
                    });
                    filterAttributes = filterAttributes.concat(genClassAttr);
               });

               if (filterAttributes.length > 0) {


                    let cName = (assciation instanceof type.UMLAssociation) ? assciation.name : tempClass.name + 'Ids';

                    mainClassesObj = {};
                    let mainPropertiesObj = {}
                    mainSchemaObj[cName] = mainClassesObj


                    mainClassesObj.type = 'object';


                    mainClassesObj.properties = mainPropertiesObj;


                    filterAttributes.forEach(attr => {
                         let propertiesObj = {};
                         mainPropertiesObj[attr.name] = propertiesObj;
                         if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                              let itemsObj = {};
                              propertiesObj.items = itemsObj;


                              itemsObj.description = (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");
                              itemsObj.type = this.utils.getType(attr.type);

                              propertiesObj.type = 'array';
                              /**
                               * Add MinItems of multiplicity is 1..*
                               */
                              if (attr.multiplicity === "1..*") {
                                   propertiesObj.minItems = 1;
                              }

                         } else {
                              propertiesObj.description = (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                              propertiesObj.type = this.utils.getType(attr.type);
                              if (attr.type instanceof type.UMLEnumeration) {
                                   propertiesObj.enum = this.utils.getEnumerationLiteral(attr.type);
                              }

                         }
                    });



                    if (this.required.getRequiredAttributes(filterAttributes).length > 0) {
                         mainClassesObj.required = this.required.addRequiredAttributes(filterAttributes);
                    }


               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = Association;