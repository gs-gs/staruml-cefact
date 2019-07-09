const openAPI = require('./openapi');
const fs = require('fs');
/**
 *
 *
 * @class Utils
 */
class Utils {
     /**
      * Creates an instance of Utils.
      * 
      * @constructor Utils
      */
     constructor() {
          this.errorContent = [];
          this.mFileName = '/error.txt';
     }
     /**
      * @function writeErrorToFile
      * @description Catch the error and write it to file
      * @param {*} error
      * @memberof Utils
      */
     writeErrorToFile(error) {
          this.errorContent.push(error.message);
          fs.writeFile(openAPI.getFilePath() + this.mFileName, JSON.stringify(this.errorContent), function(err) {
               if (err) {
                    console.error("Error writing file", err);
               }
          });
     }
     
     /**
      * @function buildDescription
      * @description Description replace (') with ('')
      * @param {string} desc
      */
     buildDescription(desc) {
          if (desc)
               return desc.replace(/\'/g, "''")

          return null;
     }

     /**
      * @function buildParameter
      * @description Adds parameters to the file
      * @param {string} name
      * @param {string} type
      * @param {string} description
      * @param {boolean} required
      * @param {string} schema 
      */
     buildParameter(name, type, description, required, schema,paramsObject) {

          paramsObject.name=name;
          paramsObject.in=type;
          paramsObject.description=description;
          paramsObject.required=required;
          paramsObject.schema=schema;

     }
     /**
      * @function getType
      * @description Returns type of attribute in string, Get attribute type number,boolean,string 
      * @returns string 
      * @param {string} starUMLType 
      */
     getType(starUMLType) {
          if (starUMLType === "Numeric") {
               return "number";
          } else if (starUMLType === "Indicator") {
               return "boolean";
          } else return "string";
     }
     
}

module.exports = Utils;