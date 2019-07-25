const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const j2yaml = require('json2yaml');
const openAPI = require('./openapi');
const MainJSON = require('./mainjson');
const constant = require('./constant');

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

     createJSON() {
          try {
               let basePath;
               //Direct json from JsonOject
               basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
               // fs.writeFileSync(basePath, JSON.stringify(MainJSON.getJSON()));
               fs.writeFileSync(basePath, JSON.stringify(MainJSON.getJSON(), null, 4));


          } catch (error) {
               console.error("Error generating JSON file", error);
               this.utils.writeErrorToFile(error);
          }
     }
     createYAML() {
          let basePath;
          let ymlText = j2yaml.stringify(MainJSON.getJSON());
          basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.yml');
          fs.writeFileSync(basePath, ymlText);
     }

     /**
      *
      * 
      * 
      * @memberof FileGenerator
      */
     generate() {
          try {

               if (openAPI.getFileType() == 1) {
                    /**
                     * Convert yml data to JSON file
                     */
                    this.createJSON();


               } else if (openAPI.getFileType() == 2) {

                    // Direct YML from JsonObject
                    this.createYAML();

               } else {



                    //Direct conversion from JsonObject to JSON/YAML

                    //Direct json from JsonOject
                    this.createJSON();

                    // Direct YML from JsonObject
                    this.createYAML();

               }
               app.toast.info(constant.msgsuccess);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = FileGenerator;