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
      * @memberof CodeWriter
      */
     writeErrorToFile(error,mFilePath) {
          this.errorContent.push(error.message);
          fs.writeFile(mFilePath + this.mFileName, JSON.stringify(this.errorContent), function(err) {
               if (err) {
                    console.error("Error writing file", err);
               }
          });
     }
     /**
      * @function findGeneralizationOfClass
      * @description Find all generalization of UMLClass
      * @param {UMLClass} objClass 
      */
     findGeneralizationOfClass(objClass,fullPath) {
          try {
               let generalizeClasses = app.repository.select("@UMLGeneralization");
               let filterGeneral = generalizeClasses.filter(item => {
                    return item.source._id == objClass._id
               });
               return filterGeneral;
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error,fullPath);
          }
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
      * @param {CodeWriter} codeWriter class instance
      * @param {string} name
      * @param {string} type
      * @param {string} description
      * @param {boolean} required
      * @param {string} schema 
      */
     buildParameter(codeWriter, name, type, description, required, schema,paramsObject) {
          // codeWriter.writeLine("parameters:");
          codeWriter.writeLine("- description: " + description, 0, 0);

          codeWriter.writeLine("in: " + type, 1, 0);
          codeWriter.writeLine("name: " + name, 0, 0);
          codeWriter.writeLine("required: " + required, 0, 0);
          codeWriter.writeLine("schema: " + schema, 0, 1);

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

exports.Utils = Utils;