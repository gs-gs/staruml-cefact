const openAPI = require('./openapi');
/**
 * Required class returns the API Required 
 *
 * @class Required
 */
class Required {
     /**
      * Creates an instance of Required.
      * 
      * @constructor Required
      */
     constructor() {
         
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
     addRequiredAttributes(arrAttributes) {
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
     
}

module.exports = Required;