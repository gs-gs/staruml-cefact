const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const j2yaml = require('json2yaml');
const openAPI = require('./openapi');
const MainJSON = require('./mainjson');
const constant = require('./constant');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
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
                    this.createJSON();


               } else if (openAPI.getFileType() == 2) {
                    // Convert JSON object to YAML using j2yaml and save the file
                    this.createYAML();

               } else {



                    //Direct conversion from JsonObject to JSON/YAML

                    //Direct json from JsonOject
                    this.createJSON();

                    // Direct YML from JsonObject
                    this.createYAML();

               }
               console.log("Mode", openAPI.getMode());
               if (openAPI.getMode() == 0) {
                    if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                         app.dialogs.showErrorDialog(openAPI.getError().msg);
                         return;
                    }
                    app.toast.info(constant.msgsuccess);
               } else if (openAPI.getMode() == 1) {
                    let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                    parser.validate(pathValidator, (err, api) => {
                         if (err) {
                              // Error

                              app.dialogs.showErrorDialog("Error in Package \'" + openAPI.getUMLPackage().name + "\' : " + err.message);
                              console.log("Error : ", err.toJSON());
                              console.log("Error : ", err.message);
                         } else {
                              // Success
                              app.toast.info("Package \'" + openAPI.getUMLPackage().name + "\' Tested Successfully");
                              console.log("success : ", api);
                         }
                    });
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = FileGenerator;