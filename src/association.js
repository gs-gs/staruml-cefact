const Utils=require('./utils');
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
     }

     getAssociations(){
          return this.arrAssoc;
     }
     
     getAssociationProperties(assocClassLink,mainPropertiesObj){
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
}

module.exports = Association;