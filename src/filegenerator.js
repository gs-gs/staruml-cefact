const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const j2yaml = require('json2yaml');
const openAPI = require('./openapi');
const MainJSON=require('./mainjson');
const constant=require('./constant');

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

     createJSON(){
          try {
               let basePath;
               //Direct json from JsonOject
               basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
               fs.writeFileSync(basePath, JSON.stringify(MainJSON.getJSON(), null, 4));
               

          } catch (error) {
               console.error("Error generating JSON file", error);
               this.utils.writeErrorToFile(error);
          }
     }
     createYAML(){
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
                    this.createJSON();
                    this.createYAML();                    
               } else if (openAPI.getFileType() == 2) {
                    // Convert JSON object to YAML using j2yaml and save the file
                    this.createYAML();
               } else if (openAPI.getFileType() == 3) {
                    //  Directly create JSON file from JSON Object
                    this.createJSON();
               }
               app.toast.info(constant.msgsuccess);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = FileGenerator;