const Utils=require('./utils');
const Generalization=require('./generalization');
const Required=require('./required');
const constant =require('./constant');
/**
 *
 *
 * @class Association
/**
 * Association class returns the API Association 
 *
 * @class Association
 */
class Association {
     /**
      * Creates an instance of Association.
      * 
      * @constructor Association
      */
     constructor() {
          this.utils=new Utils();   
          this.arrAssoc=[];  
          this.required=new Required();
     }

     getAssociations(){
          return this.arrAssoc;
     }
     
     addAssociationProperties(assocClassLink,mainPropertiesObj){
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
      * @param {Object} main properties json object
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
                         objAllOfArry['$ref']=constant.getReference() + associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         objAllOfArry['$ref']=constant.getReference() + associationClass.associationSide.end2.reference.name;
                    }

                    allOfArray.push(objAllOfArry);


                    objAllOfArry={};
                    objAllOfArry['$ref']=constant.getReference() + associationClass.classSide.name;
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
                         objAllOfArry['$ref']=constant.getReference()+ associationClass.associationSide.end2.reference.name + 'Ids';
                    }
                    else{
                         objAllOfArry['$ref']=constant.getReference()+ associationClass.associationSide.end2.reference.name;
                    }
                    allOfArray.push(objAllOfArry);

                    objAllOfArry={};
                    objAllOfArry['$ref']=constant.getReference()+ associationClass.classSide.name;
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
      * @function getAssociationOfClass
      * @description Find all association of UMLClass
      * @param {UMLClass} objClass 
      */
     getAssociationOfClass(objClass) {
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
      * @function writeAssociationProperties
      * @description 
      * @param {Object} Main open api json object 
      * @param {UMLClass} assciation 
      */
     writeAssociationProperties(mainClassesObj, assciation,mainSchemaObj) {
          try {

               let tempClass;
               if (assciation instanceof type.UMLAssociation) {
                    tempClass = assciation.end2.reference;

               } else {
                    tempClass = assciation;
               }

               let generalization=new Generalization();
               let generalizeClasses = generalization.findGeneralizationOfClass(tempClass);

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
               mainSchemaObj[cName]=mainClassesObj
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



               if (this.required.getRequiredAttributes(filterAttributes).length > 0) {
                    mainClassesObj.required=this.required.addRequiredAttributes(filterAttributes);
               }


               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = Association;