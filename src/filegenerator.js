const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
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

               if (openAPI.getAppMode() == openAPI.APP_MODE_GEN) {
                    // check for if any error  available or not 
                    if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                         app.dialogs.showErrorDialog(openAPI.getError().msg);
                         return;
                    }

                    // Finds the path of generated file to validate by swagger-parser
                    let basePath;
                    if (openAPI.getFileType() == 1) {
                         basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                    } else if (openAPI.getFileType() == 2) {
                         basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.yml');
                    }

                    // Validate generated file to validate 
                    this.validateSwagger(basePath).then(data => {
                              app.toast.info(constant.msgsuccess);
                         })
                         .catch(error => {
                              app.dialogs.showErrorDialog(error.message);
                              console.log(error)
                         });

               } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {
                    let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                    if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {
                         this.validateSwagger(pathValidator).then(data => {
                                   app.dialogs.showAlertDialog(data.message);
                                   console.log(data)
                              })
                              .catch(error => {
                                   app.dialogs.showErrorDialog(error.message);
                                   console.log(error)
                              });
                    } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {
                         this.validateSwagger(pathValidator).then(data => {
                                   // app.dialogs.showErrorDialog(data.message);
                                   openAPI.addSummery(data.message);
                                   console.log(data)
                              })
                              .catch(error => {
                                   // app.dialogs.showErrorDialog(error.message);
                                   openAPI.addSummery(error.message);
                                   console.log(error)
                              });
                    }
               }
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
     validateSwagger(pathValidator) {
          return new Promise((resolve, reject) => {

               parser.validate(pathValidator, (err, api) => {
                    if (err) {
                         // Error
                         reject(err);
                    } else {
                         // Success
                         resolve({
                              message: "Package \'" + openAPI.getUMLPackage().name + "\' Tested Successfully"
                         })
                    }
               });
          });
     }
}

module.exports = FileGenerator;