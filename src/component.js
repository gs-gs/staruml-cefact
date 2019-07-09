const Utils=require('./utils');
const Properties =require('./properties');
const openAPI = require('./openapi');

/**
 * Component class adds all classes from the class diagram
 *
 * @class Component
 */
class Component {
     /**
      *Creates an instance of Component.
      * @param {string} fullPath
      * @memberof Component
      */
     constructor() {
          this.mainComponentObj={};
          this.mainSchemaObj={};
          this.utils=new Utils();     
          this.arrAttr = [];
          this.arrAssoc = [];
          
     }

     /**
      *
      *
      * @param {UMLClass} classes
      * @param {UMLAssociationClassLink} classLink
      * @returns
      * @memberof Component
      */
     getComponent() {
          // let classes=OpenApi.getUniqueClasses();
          // console.log("--------------thi-1",mOpenApi.getName())
          // console.log("--------------thi-2",OpenApi.getName());
          let classes=openAPI.getClasses();
          let classLink = app.repository.select("@UMLAssociationClassLink");
          let arrIdClasses = [];
          let flagNoName = false;
          let noNameRel = [];
          this.mainComponentObj.schemas=this.mainSchemaObj;
          classes.forEach(objClass => {
               let mainClassesObj={};
               let mainPropertiesObj={}

               let accosElems = objClass.ownedElements.filter(item => {
                    return item instanceof type.UMLAssociation;
               });

               let assocSideClassLink = classLink.filter(item => {
                    return item.associationSide.end2.reference._id == objClass._id;
               });

               let assocClassLink = classLink.filter(item => {
                    return item.associationSide.end1.reference._id == objClass._id;
               });

               this.mainSchemaObj[objClass.name]=mainClassesObj

               mainClassesObj.type='object';


               // Adding Properties
               let properties=new Properties(objClass,assocSideClassLink);
               mainPropertiesObj=properties.getProperties();
               mainClassesObj.properties=mainPropertiesObj;
               
               

               this.arrAttr = properties.getAttributes();
               this.arrAssoc = [];

               // Adding Association
               mainPropertiesObj=this.getAssociations(assocClassLink,mainPropertiesObj);


               let arrGeneral = this.utils.findGeneralizationOfClass(objClass); // Git issue #12




               let aggregationClasses = [];

               let classAssociations = this.findAssociationOfClass(objClass);

               // Git issue #12
               let classAssociationObj={};
               classAssociations.forEach(assoc => {
                    // for (i = 0, len = objClass.ownedElements.length; i < len; i++) {
                    //     let assoc = objClass.ownedElements[i];
                    if (assoc instanceof type.UMLAssociation) {

                         let filterAssoc = this.arrAssoc.filter(item => {
                              return item.name == assoc.name;
                         });

                         if (filterAssoc.length == 0 && assoc.name != "") {

                              if (assoc.end1.aggregation == "shared") {
                                   // Adding Aggregation
                                   mainPropertiesObj=this.getAggregation(mainPropertiesObj,aggregationClasses,assoc);
                              } else {
                                   // Adding composition
                                   mainPropertiesObj=this.getComposition(mainPropertiesObj,assoc);
                              }
                              this.arrAssoc.push(assoc);
                         } else {
                              if (assoc.name == "") {
                                   flagNoName = true;
                                   let str = assoc.end1.reference.name + "-" + assoc.end2.reference.name;
                                   noNameRel.push(str);
                              }
                         }
                    } else if (assoc instanceof type.UMLGeneralization) {
                         arrGeneral.push(assoc);
                    }
               });




               // Adding Generalization
               mainClassesObj=this.getGeneralization(arrGeneral,mainClassesObj);


               let filterAttributes = this.arrAttr.filter(item => {
                    return item.isID;
               });


               if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                    let allOfArray=[];
                    mainClassesObj.allOf=allOfArray;
                    console.log("---FA-1")
                    let allOfObj={};
                    allOfObj['$ref']='#/components/schemas/' + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj={};
                    allOfObj['type']='object';
                    allOfArray.push(allOfObj);
                    
               }

               // Adding Required 
               if (this.getRequiredAttributes(this.arrAttr).length > 0) {

                    mainClassesObj.required=this.getListRequiredAttributes(this.arrAttr);
               }

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (assocSideClassLink.length > 0) {
                    aggregationClasses.push(objClass);
                    // this.writeAssociationProperties(objClass);
               }
               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });
                    if (filter.length == 0) {
                         this.writeAssociationProperties(mainClassesObj, itemClass);
                         arrIdClasses.push(itemClass)
                    }
               });
          });




          return this.mainComponentObj;
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
     getAggregation(mainPropertiesObj,aggregationClasses,assoc) {
          let propertiesObj={};
          aggregationClasses.push(assoc.end2.reference);
          mainPropertiesObj[assoc.name] = propertiesObj;

          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {

               console.log("----CA-1", assoc.name);
               let itemsObj = {};
               propertiesObj.items = itemsObj;
               let allOfArray = [];
               itemsObj.allOf = allOfArray;



               let objAllOfArry = {};
               objAllOfArry['$ref'] = '#/components/schemas/' + assoc.end2.reference.name + 'Ids';
               allOfArray.push(objAllOfArry);

               objAllOfArry = {};
               objAllOfArry['type'] = 'object';
               allOfArray.push(objAllOfArry);

               propertiesObj.type = 'array';
               if (assoc.end2.multiplicity == "1..*") {
                    propertiesObj.minItems = 1;
               }
               console.log(propertiesObj);
          } else {
               //AskQue
               console.log("----CA-2", assoc.name);
               let allOfArray = [];
               propertiesObj.allOf = allOfArray;


               let allOfObj = {};
               allOfObj['$ref'] = '#/components/schemas/' + assoc.end2.reference.name + 'Ids';
               allOfArray.push(allOfObj);

               allOfObj = {};
               allOfObj['type'] = 'object';
               allOfArray.push(allOfObj);
               console.log(propertiesObj);
          }
          return mainPropertiesObj;
     }
     /**
      *
      *
      * @param {Object} mainPropertiesObj
      * @param {UMLAssociation} assoc
      * @returns mainPropertiesObj
      * @memberof Component
      */
     getComposition(mainPropertiesObj,assoc){
          let propertiesObj={};
          mainPropertiesObj[assoc.name]=propertiesObj;
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {
               console.log("----CA-3",assoc.name);
               let itemsObj={};
               propertiesObj.items=itemsObj;
               itemsObj['$ref']='#/components/schemas/' + assoc.end2.reference.name;
               propertiesObj.type='array';
               /**
                * Add MinItems of multiplicity is 1..*
                */
               if (assoc.end2.multiplicity === "1..*") {
                    propertiesObj.minItems=1;
               }
               console.log(propertiesObj);
          } else {
               console.log("----CA-4",assoc.name);
               propertiesObj['$ref']='#/components/schemas/' + assoc.end2.reference.name;
               console.log(propertiesObj);
          }
          return mainPropertiesObj;
     }
     /**
      *
      * @param {Array} arrGeneral
      * @param {Object} mainClassesObj
      * @returns
      * @memberof Component
      */
     getGeneralization(arrGeneral,mainClassesObj){
          /**
           * Add Generalization class
           * Inherite all properties of parent class
           */
          if (arrGeneral.length > 0) {
               console.log("---WG-1")
               let allOfArray=[];
               mainClassesObj.allOf=allOfArray;
               arrGeneral.forEach(generalizeClass => {
                    let allOfObj={};
                    allOfObj['$ref']='#/components/schemas/'+ generalizeClass.target.name;
                    allOfArray.push(allOfObj);


                    allOfObj={};
                    allOfObj['type']='object';
                    allOfArray.push(allOfObj);
               });
               
          }
          return mainClassesObj;
     }
     /**
      *
      * @param {UMLAssociationClassLink} assocClassLink
      * @param {Object} mainPropertiesObj
      * @returns mainPropertiesObj
      * @memberof Component
      */
     getAssociations(assocClassLink,mainPropertiesObj){
          /**
                * Add asscociation class Properties
                * eg.
                *   TransportMeansParty
                         allOf:
                        - $ref: '#/components/schemas/TransportPartyIds'
                        - $ref: '#/components/schemas/TransportMeansParty'
                        - type: object
                */
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
      * @param {Object} main openapi json object
      * @param {UMLAssociationClassLink} associationClass 
      */
     writeAssociationClassProperties(mainPropertiesObj, associationClass) {
          try {
               let propertiesObj={};
               var end2Attributes = associationClass.associationSide.end2.reference.attributes;
               var classSideAtributes = associationClass.classSide.attributes;
               mainPropertiesObj[associationClass.classSide.name]=propertiesObj;

               if (associationClass.associationSide.end2.multiplicity == "0..*" || associationClass.associationSide.end2.multiplicity == "1..*") {
                    console.log("----WAC-1",associationClass.classSide.name);
                    let itemsObj={};
                    propertiesObj.items=itemsObj;
                    let allOfArray=[];
                    itemsObj.allOf=allOfArray;

                    let objAllOfArry={};
                    if (associationClass.associationSide.end1.aggregation == "shared"){
                         objAllOfArry['$ref']='#/components/schemas/' + associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         objAllOfArry['$ref']='#/components/schemas/' + associationClass.associationSide.end2.reference.name;
                    }

                    allOfArray.push(objAllOfArry);


                    objAllOfArry={};
                    objAllOfArry['$ref']='#/components/schemas/' + associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    objAllOfArry['type']='object';
                    allOfArray.push(objAllOfArry);



                    propertiesObj.type='array';
                    if (associationClass.associationSide.end2.multiplicity == "1..*") {
                         propertiesObj.minItems=1;
                    }

               } else {
                    //AskQue
                    console.log("----WAC-2",associationClass.classSide.name);
                    let allOfArray=[];
                    let objAllOfArry={};
                    propertiesObj.allOf=allOfArray;

                    if (associationClass.associationSide.end1.aggregation == "shared"){
                         objAllOfArry['$ref']='#/components/schemas/'+ associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         objAllOfArry['$ref']='#/components/schemas/'+ associationClass.associationSide.end2.reference.name;
                    }
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    objAllOfArry['$ref']='#/components/schemas/'+ associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    objAllOfArry['type']='object';
                    allOfArray.push(objAllOfArry);

               }

          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }

     /**
      * @function findAssociationOfClass
      * @description Find all association of UMLClass
      * @param {UMLClass} objClass 
      */
     findAssociationOfClass(objClass) {
          try {
               let associations = app.repository.select("@UMLAssociation");
               let filterAssociation = associations.filter(item => {
                    return item.end1.reference._id == objClass._id
               });
               console.log(objClass.name, filterAssociation);
               return filterAssociation;
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }

     }

     /**
      * @function getRequiredAttributes
      * @description 
      * @param {UMLAttributes[]} arrAttributes 
      * @returns {Array} array of string
      */
     getRequiredAttributes(arrAttributes) {
          if (arrAttributes) {
               let requiredAttr = [];
               arrAttributes.forEach(item => {
                    if (item.multiplicity == "1" || item.multiplicity == "1..*") {
                         requiredAttr.push(item.name);
                    }

               });
               return (requiredAttr);
          }
     }
     /**
      *
      *
      * @param {Array} arrAttributes
      * @returns
      * @memberof Component
      */
     getListRequiredAttributes(arrAttributes) {
          let requiredAttr = [];
          if (arrAttributes) {
               
               arrAttributes.forEach(item => {
                    if (item.multiplicity == "1" || item.multiplicity == "1..*") {
                         requiredAttr.push(item.name);
                    }

               });
               return (requiredAttr);
          }
     }
     /**
      * @function writeAssociationProperties
      * @description 
      * @param {Object} Main open api json object 
      * @param {UMLClass} assciation 
      */
     writeAssociationProperties(mainClassesObj, assciation) {
          try {

               let tempClass;
               if (assciation instanceof type.UMLAssociation) {
                    tempClass = assciation.end2.reference;

               } else {
                    tempClass = assciation;
               }

               let generalizeClasses = this.utils.findGeneralizationOfClass(tempClass);

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

               
               let cName=(assciation instanceof type.UMLAssociation) ?assciation.name:tempClass.name + 'Ids';
               
               mainClassesObj={};
               let mainPropertiesObj={}
               this.mainSchemaObj[cName]=mainClassesObj
               let propertiesObj={};

               mainClassesObj.type='object';

               
               mainClassesObj.properties=mainPropertiesObj;


               filterAttributes.forEach(attr => {
                    mainPropertiesObj[attr.name]=propertiesObj;
                    if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                         console.log('---WAP--1',attr.name);
                         let itemsObj={};
                         propertiesObj.items=itemsObj;


                         itemsObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");
                         itemsObj.type=this.utils.getType(attr.type);

                         propertiesObj.type='array';
                         /**
                          * Add MinItems of multiplicity is 1..*
                          */
                         if (attr.multiplicity === "1..*") {
                              propertiesObj.minItems=1;
                         }

                    } else {
                         console.log('---WAP--2',attr.name);
                         propertiesObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                         propertiesObj.type=this.utils.getType(attr.type);
                         if (attr.type instanceof type.UMLEnumeration) {
                              propertiesObj.enum=this.getEnumerationLiteral(attr.type);
                         }

                    }
               });



               if (this.getRequiredAttributes(filterAttributes).length > 0) {
                    mainClassesObj.required=this.getListRequiredAttributes(filterAttributes);
               }


               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = Component;