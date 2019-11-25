/**
 * @description Required class returns the API Required 
 * @class Required
 */
class Required {

     /**
      * @constructor Creates an instance of Required.
      */
     constructor() {

     }

     /**
      * @function getRequiredAttributes
      * @description array of string
      * @param {UMLAttributes[]} arrAttributes 
      * @returns {Array}
      * @memberof Required
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
      * @function addRequiredAttributes
      * @description returns the array of required attributes in String
      * @param {Array} arrAttributes
      * @returns {Array}
      * @memberof Required
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