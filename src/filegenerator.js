const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const j2yaml = require('json2yaml');
/**
 *
 *
 * @class FileGenerator
/**
 * FileGenerator class generate JSON, YAML file based of selection
 *
 * @class FileGenerator
 */
class FileGenerator {
     /**
      * Creates an instance of FileGenerator.
      * 
      * @constructor FileGenerator
      */
     constructor() {
          this.utils = new Utils();
     }


     /**
      *
      * @param {string} fullPath
      * @param {UMLPackage} mainElem
      * @param {string} fileType
      * @param {Object} mainOpenApiObj
      * @memberof FileGenerator
      */
     generate(fullPath, mainElem, fileType, mainOpenApiObj) {
          try {
               console.log("fileGeneration", fullPath);
               let basePath;
               if (fileType == 1) {
                    /**
                     * Convert yml data to JSON file
                     */


                    try {
                         //Direct json from JsonOject
                         basePath = path.join(fullPath, mainElem.name + "-test" + '.json');
                         fs.writeFileSync(basePath, JSON.stringify(mainOpenApiObj));

                    } catch (error) {
                         console.error("Error generating JSON file", error);
                         this.utils.writeErrorToFile(error, fullPath);
                    }
               } else if (fileType == 2) {

                    // Direct YML from JsonObject
                    let ymlText = j2yaml.stringify(mainOpenApiObj);
                    basePath = path.join(fullPath, mainElem.name + "-test" + '.yml');
                    fs.writeFileSync(basePath, ymlText);
               } else {



                    //Direct conversion from JsonObject to JSON/YAML

                    //Direct json from JsonOject
                    basePath = path.join(fullPath, mainElem.name + "-test" + '.json');
                    fs.writeFileSync(basePath, JSON.stringify(mainOpenApiObj));

                    // Direct YML from JsonObject
                    let ymlText = j2yaml.stringify(mainOpenApiObj);
                    basePath = path.join(fullPath, mainElem.name + "-test" + '.yml');
                    fs.writeFileSync(basePath, ymlText);
               }
               app.toast.info("OpenAPI generation completed");
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error, fullPath);
          }
     }
}

module.exports = FileGenerator;