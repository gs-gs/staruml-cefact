const common=require('./common-utils');
/**
 *
 *
 * @class Component
 */
class Component {
     /**
      * Creates an instance of Component.
      * 
      * @constructor Component
      */
     constructor(fullPath) {
          this.mainComponentObj={};
          this.mainSchemaObj={};
          this.utils=new common.Utils();     
          this.fullPath=fullPath;
          this.arrAttr = [];
          this.arrAssoc = [];
     }

     
     /**
      * Return Info object 
      * 
      * @function getData
      * @return {string}
      */
     getComponent(classes,classLink,codeWriter) {
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

               codeWriter.writeLine(objClass.name + ":");
               this.mainSchemaObj[objClass.name]=mainClassesObj

               codeWriter.writeLine("type: object", 1, 0);
               mainClassesObj.type='object';

               codeWriter.writeLine("properties:" + ((objClass.attributes.length == 0 && accosElems.length == 0 && assocClassLink.length == 0) ? " {}" : ""));
               codeWriter.writeLine(null, 1, 0);

               // Adding Properties
               mainPropertiesObj=this.getProperties(objClass,assocSideClassLink,codeWriter);
               mainClassesObj.properties=mainPropertiesObj;
               

               this.arrAssoc = [];

               // Adding Association
               mainPropertiesObj=this.getAssociations(assocClassLink,mainPropertiesObj,codeWriter);


               let arrGeneral = this.utils.findGeneralizationOfClass(objClass,this.fullPath); // Git issue #12




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
                                   mainPropertiesObj=this.getAggregation(mainPropertiesObj,aggregationClasses,assoc,codeWriter);
                              } else {
                                   // Adding composition
                                   mainPropertiesObj=this.getComposition(mainPropertiesObj,assoc,codeWriter);
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



               codeWriter.writeLine(null, 0, 1);

               // Adding Generalization
               mainClassesObj=this.getGeneralization(arrGeneral,mainClassesObj,codeWriter);


               let filterAttributes = this.arrAttr.filter(item => {
                    return item.isID;
               });


               if (filterAttributes.length > 0 && assocSideClassLink.length > 0) {
                    let allOfArray=[];
                    mainClassesObj.allOf=allOfArray;
                    console.log("---FA-1")
                    codeWriter.writeLine("allOf:");
                    let allOfObj={};
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + objClass.name + "Ids'", 1, 0);
                    allOfObj['$ref']='#/components/schemas/' + objClass.name + 'Ids';
                    allOfArray.push(allOfObj);

                    allOfObj={};
                    codeWriter.writeLine("- type: object");
                    allOfObj['type']='object';
                    allOfArray.push(allOfObj);
                    codeWriter.writeLine(null, 0, 1);
                    
               }

               // Adding Required 
               if (this.getRequiredAttributes(this.arrAttr).length > 0) {
                    codeWriter.writeLine("required: [" + this.getRequiredAttributes(this.arrAttr) + "]");

                    mainClassesObj.required=this.getListRequiredAttributes(this.arrAttr);
               }
               codeWriter.writeLine(null, 0, 1);

               /**
                * Write sceparate schema for isID property of aggregation and relationship class
                **/
               if (assocSideClassLink.length > 0) {
                    aggregationClasses.push(objClass);
                    // this.writeAssociationProperties(codeWriter,objClass);
               }
               aggregationClasses.forEach(itemClass => {
                    let filter = arrIdClasses.filter(subItem => {
                         return itemClass.name == subItem.name;
                    });
                    if (filter.length == 0) {
                         this.writeAssociationProperties(mainClassesObj,codeWriter, itemClass);
                         arrIdClasses.push(itemClass)
                    }
               });
          });




          return this.mainComponentObj;
     }
     getAggregation(mainPropertiesObj,aggregationClasses,assoc,codeWriter) {
          let propertiesObj={};
          aggregationClasses.push(assoc.end2.reference);
          codeWriter.writeLine(assoc.name + ":"); // #7 resolve issue
          mainPropertiesObj[assoc.name] = propertiesObj;

          codeWriter.writeLine(null, 1, 0);
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {

               console.log("----CA-1", assoc.name);
               let itemsObj = {};
               propertiesObj.items = itemsObj;
               let allOfArray = [];
               itemsObj.allOf = allOfArray;



               codeWriter.writeLine("items:");
               codeWriter.writeLine("allOf:", 1, 0);
               codeWriter.writeLine("- $ref: '#/components/schemas/" + assoc.end2.reference.name + "Ids'", 1, 0);
               let objAllOfArry = {};
               objAllOfArry['$ref'] = '#/components/schemas/' + assoc.end2.reference.name + 'Ids';
               allOfArray.push(objAllOfArry);

               objAllOfArry = {};
               codeWriter.writeLine("- type: object", 0, 2);
               objAllOfArry['type'] = 'object';
               allOfArray.push(objAllOfArry);

               codeWriter.writeLine("type: array");
               propertiesObj.type = 'array';
               if (assoc.end2.multiplicity == "1..*") {
                    codeWriter.writeLine("minItems: 1");
                    propertiesObj.minItems = 1;
               }
               console.log(propertiesObj);
               codeWriter.writeLine(null, 0, 1);
          } else {
               //AskQue
               console.log("----CA-2", assoc.name);
               let allOfArray = [];
               propertiesObj.allOf = allOfArray;

               codeWriter.writeLine("allOf:");

               let allOfObj = {};
               codeWriter.writeLine("- $ref: '#/components/schemas/" + assoc.end2.reference.name + "Ids'", 1, 0);
               allOfObj['$ref'] = '#/components/schemas/' + assoc.end2.reference.name + 'Ids';
               allOfArray.push(allOfObj);

               allOfObj = {};
               codeWriter.writeLine("- type: object", 0, 2);
               allOfObj['type'] = 'object';
               allOfArray.push(allOfObj);
               console.log(propertiesObj);
          }
          return mainPropertiesObj;
     }
     getComposition(mainPropertiesObj,assoc,codeWriter){
          let propertiesObj={};
          mainPropertiesObj[assoc.name]=propertiesObj;
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {
               console.log("----CA-3",assoc.name);
               codeWriter.writeLine(assoc.name + ":");
               let itemsObj={};
               propertiesObj.items=itemsObj;
               codeWriter.writeLine("items: {$ref: '#/components/schemas/" + assoc.end2.reference.name + "'}", 1, 0);
               itemsObj['$ref']='#/components/schemas/' + assoc.end2.reference.name;
               propertiesObj.type='array';
               codeWriter.writeLine("type: array");
               /**
                * Add MinItems of multiplicity is 1..*
                */
               if (assoc.end2.multiplicity === "1..*") {
                    codeWriter.writeLine("minItems: 1");
                    propertiesObj.minItems=1;
               }
               codeWriter.writeLine(null, 0, 1);
               console.log(propertiesObj);
          } else {
               console.log("----CA-4",assoc.name);
               propertiesObj['$ref']='#/components/schemas/' + assoc.end2.reference.name;
               codeWriter.writeLine(assoc.name + ": {$ref: '#/components/schemas/" + assoc.end2.reference.name + "'}");
               console.log(propertiesObj);
          }
          return mainPropertiesObj;
     }
     getGeneralization(arrGeneral,mainClassesObj,codeWriter){
          /**
           * Add Generalization class
           * Inherite all properties of parent class
           */
          if (arrGeneral.length > 0) {
               console.log("---WG-1")
               let allOfArray=[];
               mainClassesObj.allOf=allOfArray;
               codeWriter.writeLine("allOf:");
               codeWriter.writeLine(null, 1, 0);
               arrGeneral.forEach(generalizeClass => {
                    let allOfObj={};
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + generalizeClass.target.name + "'");
                    allOfObj['$ref']='#/components/schemas/'+ generalizeClass.target.name;
                    allOfArray.push(allOfObj);


                    allOfObj={};
                    codeWriter.writeLine("- type: object");
                    allOfObj['type']='object';
                    allOfArray.push(allOfObj);
               });
               codeWriter.writeLine(null, 0, 1);
               
          }
          return mainClassesObj;
     }
     getAssociations(assocClassLink,mainPropertiesObj,codeWriter){
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
                         this.writeAssociationClassProperties(mainPropertiesObj,codeWriter, item);
                         this.arrAssoc.push(item.classSide);
                    })
               }
          return mainPropertiesObj;
     }

     getProperties(objClass,assocSideClassLink,codeWriter){
          let mainPropertiesObj={};
          this.arrAttr = [];

               let i, len;
               let propertiesObj={};
               for (i = 0, len = objClass.attributes.length; i < len; i++) {
                    propertiesObj={};
                    let attr = objClass.attributes[i];
                    let filterAttr = this.arrAttr.filter(item => {
                         return item.name == attr.name;
                    });
                    if (filterAttr.length == 0) {
                         this.arrAttr.push(attr);
                         if (assocSideClassLink.length > 0 && attr.isID) {
                              continue;
                         }
                         // if(!attr.isID ){
                         codeWriter.writeLine(attr.name + ":");
                         mainPropertiesObj[attr.name]=propertiesObj;
                         if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                              console.log("----Attr-1",attr.name);
                              let itemsObj={};
                              propertiesObj.items=itemsObj;
                              codeWriter.writeLine("items:", 1, 0);
                              codeWriter.writeLine("description: '" + (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                              itemsObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                              codeWriter.writeLine("type: " + this.utils.getType(attr.type), 0, 1);
                              itemsObj.type=this.utils.getType(attr.type);

                              

                              codeWriter.writeLine("type: array");
                              propertiesObj.type='array';
                              /**
                               * Add MinItems of multiplicity is 1..*
                               */
                              if (attr.multiplicity === "1..*") {
                                   codeWriter.writeLine("minItems: 1");
                                   propertiesObj.minItems=1;
                              }
                              codeWriter.writeLine(null, 0, 1);
                         } else {
                              console.log("----Attr-2",attr.name);
                              codeWriter.writeLine("description: '" + (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                              propertiesObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                              codeWriter.writeLine("type: " + this.utils.getType(attr.type));
                              propertiesObj.type=this.utils.getType(attr.type);

                              if (attr.type instanceof type.UMLEnumeration) {
                                   codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) + "]");
                                   propertiesObj.enum=this.getEnumerationLiteral(attr.type);
                              }
                              codeWriter.writeLine(null, 0, 1);
                         }
                         if (attr.defaultValue != "") {
                              console.log("----Attr-3",attr.name);
                              codeWriter.writeLine("default: '" + attr.defaultValue + "'", 1, 1);

                              propertiesObj.default=attr.defaultValue;
                         }
                         // }

                    }
               }
          return mainPropertiesObj;
     }

     
     /**
      * @function getEnumerationLiteral
      * @description 
      * @param {UMLEnumaration} objEnum 
      */
     getEnumerationLiteral(objEnum) {
          if (objEnum) {
               let result = objEnum.literals.map(a => a.name);
               return (result);
          }
     }

     /**
      * @function writeAssociationClassProperties
      * @description adds property for association class
      * @param {CodeWriter} codeWriter class instance
      * @param {UMLAssociationClassLink} associationClass 
      */
     writeAssociationClassProperties(mainPropertiesObj,codeWriter, associationClass) {
          try {
               let propertiesObj={};
               var end2Attributes = associationClass.associationSide.end2.reference.attributes;
               var classSideAtributes = associationClass.classSide.attributes;
               codeWriter.writeLine(associationClass.classSide.name + ":", 0, 0);
               mainPropertiesObj[associationClass.classSide.name]=propertiesObj;

               if (associationClass.associationSide.end2.multiplicity == "0..*" || associationClass.associationSide.end2.multiplicity == "1..*") {
                    console.log("----WAC-1",associationClass.classSide.name);
                    let itemsObj={};
                    codeWriter.writeLine("items:", 1, 0);
                    propertiesObj.items=itemsObj;
                    codeWriter.writeLine("allOf:", 1, 0);
                    let allOfArray=[];
                    itemsObj.allOf=allOfArray;

                    // codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'", 1, 0);
                    codeWriter.writeLine(null,1,0);
                    let objAllOfArry={};
                    if (associationClass.associationSide.end1.aggregation == "shared"){
                         codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'");
                         objAllOfArry['$ref']='#/components/schemas/' + associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name+"'");
                         objAllOfArry['$ref']='#/components/schemas/' + associationClass.associationSide.end2.reference.name;
                    }

                    allOfArray.push(objAllOfArry);


                    objAllOfArry={};
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.classSide.name + "'", 0, 0);
                    objAllOfArry['$ref']='#/components/schemas/' + associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    codeWriter.writeLine("- type: object", 0, 2);
                    objAllOfArry['type']='object';
                    allOfArray.push(objAllOfArry);



                    codeWriter.writeLine("type: array", 0, 0);
                    propertiesObj.type='array';
                    if (associationClass.associationSide.end2.multiplicity == "1..*") {
                         codeWriter.writeLine("minItems: 1", 0, 0);
                         propertiesObj.minItems=1;
                    }

                    codeWriter.writeLine(null, 0, 1);
               } else {
                    //AskQue
                    console.log("----WAC-2",associationClass.classSide.name);
                    let allOfArray=[];
                    let objAllOfArry={};
                    propertiesObj.allOf=allOfArray;
                    codeWriter.writeLine("allOf:", 0, 0);

                    // codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'", 1, 0);
                    codeWriter.writeLine(null,1,0);
                    if (associationClass.associationSide.end1.aggregation == "shared"){
                         codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name + "Ids'");
                         objAllOfArry['$ref']='#/components/schemas/'+ associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.associationSide.end2.reference.name+"'");
                         objAllOfArry['$ref']='#/components/schemas/'+ associationClass.associationSide.end2.reference.name;
                    }
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    codeWriter.writeLine("- $ref: '#/components/schemas/" + associationClass.classSide.name + "'", 0, 0);
                    objAllOfArry['$ref']='#/components/schemas/'+ associationClass.classSide.name;
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    codeWriter.writeLine("- type: object", 0, 2);
                    objAllOfArry['type']='object';
                    allOfArray.push(objAllOfArry);

               }


               // classSideAtributes.forEach(attr => {
               //         codeWriter.writeLine(attr.name+":");
               //         codeWriter.indent();
               //         codeWriter.writeLine("description: '"+(attr.documentation?this.utils.buildDescription(attr.documentation):"missing description")+"'");
               //         codeWriter.writeLine("type: "+  this.utils.getType(attr.type) );
               //         if(attr.type instanceof type.UMLEnumeration){
               //             codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) +"]");                            
               //         }   
               //         codeWriter.outdent();

               // });

               // end2Attributes.forEach(attr => {
               //     if(attr.isID){
               //         codeWriter.writeLine(attr.name+":");
               //         codeWriter.indent();
               //         codeWriter.writeLine("description: '"+(attr.documentation?this.utils.buildDescription(attr.documentation):"missing description")+"'");
               //         codeWriter.writeLine("type: "+  this.utils.getType(attr.type) );
               //         if(attr.type instanceof type.UMLEnumeration){
               //             codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) +"]");                            
               //         }   
               //         codeWriter.outdent();
               //     }
               // });



          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,this.fullPath);
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
               this.utils.writeErrorToFile(error,this.fullPath);
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
      * @param {CodeWriter} codeWriter class instance 
      * @param {UMLClass} assciation 
      */
     writeAssociationProperties(mainClassesObj,codeWriter, assciation) {
          try {

               let tempClass;
               if (assciation instanceof type.UMLAssociation) {
                    tempClass = assciation.end2.reference;

               } else {
                    tempClass = assciation;
               }

               let generalizeClasses = this.utils.findGeneralizationOfClass(tempClass,this.fullPath);

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

               codeWriter.writeLine((assciation instanceof type.UMLAssociation) ? (assciation.name + ":") : (tempClass.name + "Ids:"), 0, 0);
               
               let cName=(assciation instanceof type.UMLAssociation) ?assciation.name:tempClass.name + 'Ids';
               
               mainClassesObj={};
               let mainPropertiesObj={}
               this.mainSchemaObj[cName]=mainClassesObj
               let propertiesObj={};

               codeWriter.writeLine("type: object", 1, 0);
               mainClassesObj.type='object';

               
               // codeWriter.writeLine("properties:", 0, 0);
               codeWriter.writeLine("properties:" + ((filterAttributes.length == 0) ? " {}" : ""));
               mainClassesObj.properties=mainPropertiesObj;

               codeWriter.writeLine(null, 1, 0);

               filterAttributes.forEach(attr => {
                    mainPropertiesObj[attr.name]=propertiesObj;
                    codeWriter.writeLine(attr.name + ":", 0, 0);
                    if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                         console.log('---WAP--1',attr.name);
                         let itemsObj={};
                         codeWriter.writeLine("items:", 1, 0);
                         propertiesObj.items=itemsObj;


                         codeWriter.writeLine("description: '" + (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                         itemsObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");
                         codeWriter.writeLine("type: " + this.utils.getType(attr.type), 0, 1);
                         itemsObj.type=this.utils.getType(attr.type);

                         codeWriter.writeLine("type: array", 0, 0);
                         propertiesObj.type='array';
                         /**
                          * Add MinItems of multiplicity is 1..*
                          */
                         if (attr.multiplicity === "1..*") {
                              codeWriter.writeLine("minItems: 1", 0, 0);
                              propertiesObj.minItems=1;
                         }

                         codeWriter.writeLine(null, 0, 1);
                    } else {
                         console.log('---WAP--2',attr.name);
                         codeWriter.writeLine("description: '" + (attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description") + "'", 1, 0);
                         propertiesObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                         codeWriter.writeLine("type: " + this.utils.getType(attr.type), 0, 0);
                         propertiesObj.type=this.utils.getType(attr.type);
                         if (attr.type instanceof type.UMLEnumeration) {
                              codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) + "]", 0, 0);
                              propertiesObj.enum=this.getEnumerationLiteral(attr.type);
                         }

                         codeWriter.writeLine(null, 0, 1);
                    }
               });


               codeWriter.writeLine(null, 0, 1);

               if (this.getRequiredAttributes(filterAttributes).length > 0) {
                    codeWriter.writeLine("required: [" + this.getRequiredAttributes(filterAttributes) + "]", 0, 0);
                    mainClassesObj.required=this.getListRequiredAttributes(filterAttributes);
               }


               codeWriter.writeLine(null, 0, 1);
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,this.fullPath);
          }
     }
}

exports.Component = Component;