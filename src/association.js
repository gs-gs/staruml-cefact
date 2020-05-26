const forEach = require('async-foreach').forEach;
const utils = require('./utils');
const Generalization = require('./generalization');
const Required = require('./required');
const constant = require('./constant');
const openAPI = require('./openapi');
const dElement = require('./diagram/dElement');
/**
 * @class Association
 * @description class returns the API Association 
 */
class Association {
     /**
      * @constructor Creates an instance of Association.
      */
     constructor() {
          utils.resetErrorBlock();
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
     addAssociationClassLinkProperties(assocClassLink, mainPropertiesObj, compositionRef) {

          if (assocClassLink.length > 0) {

               assocClassLink.forEach(aclAssocSideView => {
                    let classSide = null;
                    if (openAPI.isModelDiagram()) {
                         classSide = aclAssocSideView.model.classSide;
                    } else {
                         classSide = aclAssocSideView.classSide;
                    }
                    this.arrAssoc.push(classSide);
                    this.writeAssociationClassProperties(mainPropertiesObj, aclAssocSideView.model, compositionRef);
               });
          }

          return mainPropertiesObj;
     }

     /**
      * @function writeAssociationClassProperties
      * @description adds property for association class
      * @param {Object} main properties json object
      * @param {UMLAssociationClassLink} associationClass `
      */
     writeAssociationClassProperties(mainPropertiesObj, associationClass, compositionRef) {
          let propertiesObj = {};

          if (associationClass != null && associationClass.classSide != null && associationClass.associationSide != null) {
               let associationSide = associationClass.associationSide;
               let classSide = associationClass.classSide;
               let multiplicity = associationSide.end2.multiplicity;
               mainPropertiesObj[classSide.name] = propertiesObj;
               /* Check and add multiplicity */
               if (multiplicity == "0..*" || multiplicity == "1..*") {
                    /* Add reference of Association Side Schema */
                    let itemsObj = {};
                    propertiesObj.items = itemsObj;
                    let allOfArray = [];
                    itemsObj.allOf = allOfArray;

                    let ref = '';
                    let sName = '';
                    let objAllOfArry = {};
                    if (associationSide.end1.aggregation == constant.shared) {
                         sName = utils.upperCamelCase(associationSide.end2.reference.name + 'Ids');
                         ref = constant.getReference() + sName;
                    } else {
                         sName = utils.upperCamelCase(associationSide.end2.reference.name);
                         ref = constant.getReference() + sName;
                    }
                    objAllOfArry['$ref'] = ref;
                    allOfArray.push(objAllOfArry);

                    let temp = {};
                    temp['ref'] = propertiesObj;
                    temp['sName'] = sName;
                    /* compositionRef.push('2. association 1: '+ref,temp); */
                    compositionRef.push(temp);

                    /* Add reference of Class Side Schema */
                    objAllOfArry = {};
                    sName = utils.upperCamelCase(classSide.name);
                    ref = constant.getReference() + sName;

                    objAllOfArry['$ref'] = ref;
                    allOfArray.push(objAllOfArry);

                    temp = {};
                    temp['ref'] = propertiesObj;
                    temp['sName'] = sName
                    /* compositionRef.push('3. association 2: '+ref,temp); */
                    compositionRef.push(temp);
                    objAllOfArry = {};
                    objAllOfArry['type'] = 'object';
                    allOfArray.push(objAllOfArry);
                    propertiesObj.type = 'array';
                    if (associationSide.end2.multiplicity == "1..*") {
                         propertiesObj.minItems = 1;
                    }
               } else {
                    /* Add reference of Association Side Schema */
                    let allOfArray = [];
                    let objAllOfArry = {};
                    propertiesObj.allOf = allOfArray;

                    let ref = '';
                    let sName = '';
                    if (associationSide.end1.aggregation == constant.shared) {
                         sName = utils.upperCamelCase(associationSide.end2.reference.name + 'Ids');
                         ref = constant.getReference() + sName;
                    } else {
                         sName = utils.upperCamelCase(associationSide.end2.reference.name);
                         ref = constant.getReference() + sName;
                    }
                    objAllOfArry['$ref'] = ref;
                    allOfArray.push(objAllOfArry);
                    let temp = {};
                    temp['ref'] = propertiesObj;
                    temp['sName'] = sName
                    /* compositionRef.push('4. association 3: '+ref,temp); */
                    compositionRef.push(temp);

                    /* Add reference of Class Side Schema */
                    objAllOfArry = {};
                    sName = utils.upperCamelCase(classSide.name);
                    ref = constant.getReference() + sName;
                    objAllOfArry['$ref'] = ref;
                    allOfArray.push(objAllOfArry);

                    temp = {};
                    temp['ref'] = propertiesObj;
                    temp['sName'] = sName;
                    /* compositionRef.push('5. association 4: '+ref,temp); */
                    compositionRef.push(temp);

                    objAllOfArry = {};
                    objAllOfArry['type'] = 'object';
                    allOfArray.push(objAllOfArry);

               }

          }
          /* } */

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
               let associations = utils.fetchUMLAssociation();
               if (openAPI.isModelPackage()) {

                    filterAssociation = associations.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    /* Filter association who is belong to current package */
                    filter = filterAssociation.filter(item => {
                         let parent = item.end1.reference._parent;
                         return (parent && parent instanceof type.UMLPackage && parent.name == openAPI.getExportElementName());
                    });

               } else if (openAPI.isModelDiagram()) {

                    filterAssociation = associations.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    /* Filter association who is belong to current package */
                    filter = filterAssociation;
               }

               return filter;




          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }
     }


     /* TODO : Do not remove getAssociationOfClass function. The function is in progress for experiment 
     getAssociationOfClass(objClass) {
          return new Promise((resolve, reject) => {


               try {
                    let associations = app.repository.select(openAPI.getExportElementName() + "::" + objClass.name + "::@UMLAssociation");
                    let filterAssociation = associations.filter(item => {
                         return item.end1.reference._id == objClass._id
                    });

                    let arrASS = openAPI.getPackageWiseUMLAssociation();

                    resolve(filterAssociation);
               } catch (error) {
                    utils.writeErrorToFile(error);
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
               /* let generalizeClasses = generalization.findGeneralizationOfClass(tempClass); */
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
                    mainSchemaObj[utils.upperCamelCase(cName)] = mainClassesObj


                    mainClassesObj.type = 'object';


                    mainClassesObj.properties = mainPropertiesObj;


                    filterAttributes.forEach(attr => {
                         let propertiesObj = {};
                         mainPropertiesObj[utils.lowerCamelCase(attr.name)] = propertiesObj;
                         if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                              let itemsObj = {};
                              propertiesObj.items = itemsObj;


                              itemsObj.description = (attr.documentation ? utils.buildDescription(attr.documentation) : constant.STR_MISSING_DESCRIPTION);
                              utils.addAttributeType(itemsObj, attr);

                              propertiesObj.type = 'array';
                              /**
                               * Add MinItems of multiplicity is 1..*
                               */
                              if (attr.multiplicity === "1..*") {
                                   propertiesObj.minItems = 1;
                              }

                         } else {
                              propertiesObj.description = (attr.documentation ? utils.buildDescription(attr.documentation) : constant.STR_MISSING_DESCRIPTION);

                              utils.addAttributeType(propertiesObj, attr);
                              if (attr.type instanceof type.UMLEnumeration) {

                                   propertiesObj.enum = utils.getEnumerationLiteral(attr.type);

                              }

                         }
                    });



                    if (this.required.getRequiredAttributes(filterAttributes).length > 0) {
                         mainClassesObj.required = this.required.addRequiredAttributes(filterAttributes);
                    }


               }
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }
     }
}

module.exports = Association;