const constant = require('./constant');
/**
 * @class Composition 
 * @description class returns the API Composition 
 */
class Composition {
     /**
      * @constructor Creates an instance of Composition.
      */
     constructor(reqAttr) {
          this.arrAttRequired=reqAttr;
     }


     /**
      * @function addComposition
      * @description adds composition in properties object
      * @param {Object} mainPropertiesObj
      * @param {UMLAssociation} assoc
      * @returns {Object}
      * @memberof Composition
      */
     addComposition(mainPropertiesObj, assoc, assocName,compositionRef) {
          let propertiesObj = {};
          mainPropertiesObj[assocName] = propertiesObj;
          let ref='';
          let sName='';
          let objAttrRe={
               name:assocName,
               multiplicity:assoc.end2.multiplicity
          };
          this.arrAttRequired.push(objAttrRe);
          /* mainPropertiesObj[assoc.name] = propertiesObj; */
          if (assoc.end2.multiplicity === "0..*" || assoc.end2.multiplicity === "1..*") {
               let itemsObj = {};
               propertiesObj.items = itemsObj;
               sName=assoc.end2.reference.name;
               ref=constant.getReference() + sName;
               itemsObj['$ref'] = ref;
               propertiesObj.type = 'array';
               /**
                * Add MinItems of multiplicity is 1..*
                */
               if (assoc.end2.multiplicity === "1..*") {
                    propertiesObj.minItems = 1;
               }
          } else {
               sName=assoc.end2.reference.name;
               ref=constant.getReference() + sName;
               propertiesObj['$ref'] = ref;
          }
          let temp={};
          temp['ref']=propertiesObj;
          temp['sName']=sName;
          // compositionRef.push('6. composition : '+ref,temp);
          compositionRef.push(temp);
          return mainPropertiesObj;
     }
}

module.exports = Composition;