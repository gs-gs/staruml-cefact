const openAPI = require('./openapi');
const fs = require('fs');
const constant=require('./constant');
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

     /**
      *
      *
      * @param {UMLInterfaceRealization} objInterface
      * @param {Object} requestBodyObj
      * @memberof Operations
      */
     buildRequestBody(objInterface,requestBodyObj) {

          let contentObj={};
          requestBodyObj.content=contentObj;

          let appJsonObject={};
          contentObj['application/json']=appJsonObject;

          let schemaObj={};
          appJsonObject.schema=schemaObj;

          schemaObj['$ref']=constant.getReference() + objInterface.source.name;


          requestBodyObj.description='';
          requestBodyObj.required=true;

     }

     /**
      *
      *
      * @param {Array} parametersArray
      * @param {Object} objOperation
      * @memberof Operations
      */
     writeQueryParameters(parametersArray, objOperation) {
          try {
               objOperation.parameters.forEach(itemParameters => {
                    let paramsObject = {};
                    if (itemParameters.name != "id" && itemParameters.name != "identifier") {
                         parametersArray.push(paramsObject);
                         let objSchema = {};
                         objSchema.type = 'string';
                         if (!(itemParameters.type instanceof type.UMLClass)) {
                              this.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
                                   this.utils.buildDescription(itemParameters.documentation) :
                                   "missing description"), false, objSchema,paramsObject);
                         } else {

                              this.buildParameter(itemParameters.type.name + "." + itemParameters.name, "query", (itemParameters.documentation ?
                                   this.utils.buildDescription(itemParameters.documentation) :
                                   "missing description"), false, objSchema,paramsObject);


                         }
                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.writeErrorToFile(error);
          }
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
     // writeQueryParameters(parametersArray, objOperation) {
     //      ////Here to start
     //      try {
     //           objOperation.parameters.forEach(itemParameters => {
     //                let paramsObject={};
                    
     //                if (itemParameters.name != "id" && itemParameters.name != "identifier") {
     //                     parametersArray.push(paramsObject);
     //                     let objSchema={};
     //                     objSchema.type='string';
     //                     if (!(itemParameters.type instanceof type.UMLClass)) {
     //                          //  name, type, description, required, schema
                              
     //                          this.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
     //                               this.utils.buildDescription(itemParameters.documentation) :
     //                               "missing description"), false, objSchema,paramsObject);

     //                               //AskQue
     //                               // this.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
     //                               //      this.utils.buildDescription(itemParameters.documentation) :
     //                               //      "missing description"), false, "{type: string}");
     //                     } else {

     //                          let param = itemParameters.type.attributes.filter(item => {
     //                               return itemParameters.name.toUpperCase() == item.name.toUpperCase();
     //                          });

     //                          if (param.length == 0) {
     //                               let generalizeClasses = this.generalization.findGeneralizationOfClass(itemParameters.type,getFilePath());
     //                               console.log(generalizeClasses);
     //                               param = generalizeClasses[0].target.attributes.filter(item => {
     //                                    return itemParameters.name.toUpperCase() == item.name.toUpperCase();
     //                               });
     //                          }

     //                          if (param[0].type == "DateTime") {
     //                               this.buildParameter("before_" + param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);
     //                               this.buildParameter("after_" + param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);

     //                          } else {
     //                               this.buildParameter(param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);
     //                          }

     //                     }
     //                }
     //           });
     //      } catch (error) {
     //           console.error("Found error", error.message);
     //           this.writeErrorToFile(error,getFilePath());
     //      }
     // }
     
}

module.exports = Utils;