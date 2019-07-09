const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const j2yaml = require('json2yaml');
const openAPI = require('./openapi');

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
      * 
      * @param {Object} mainOpenApiObj
      * @memberof FileGenerator
      */
     generate(mainOpenApiObj) {
          try {
               console.log("fileGeneration", openAPI.getFilePath());
               let basePath;
               if (openAPI.getFileType() == 1) {
                    /**
                     * Convert yml data to JSON file
                     */


                    try {
                         //Direct json from JsonOject
                         basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + "-test" + '.json');
                         fs.writeFileSync(basePath, JSON.stringify(mainOpenApiObj));

                    } catch (error) {
                         console.error("Error generating JSON file", error);
                         this.utils.writeErrorToFile(error);
                    }
               } else if (openAPI.getFileType() == 2) {

                    // Direct YML from JsonObject
                    let ymlText = j2yaml.stringify(mainOpenApiObj);
                    basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + "-test" + '.yml');
                    fs.writeFileSync(basePath, ymlText);
               } else {



                    //Direct conversion from JsonObject to JSON/YAML

                    //Direct json from JsonOject
                    basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + "-test" + '.json');
                    fs.writeFileSync(basePath, JSON.stringify(mainOpenApiObj));

                    // Direct YML from JsonObject
                    let ymlText = j2yaml.stringify(mainOpenApiObj);
                    basePath = path.join(openAPI.getFilePath(),openAPI.getUMLPackage().name + "-test" + '.yml');
                    fs.writeFileSync(basePath, ymlText);
               }
               app.toast.info("OpenAPI generation completed");
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = FileGenerator;