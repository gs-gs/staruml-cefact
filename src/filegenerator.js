const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const openAPI = require('./openapi');
const MainJSON = require('./mainjson');
const constant = require('./constant');
const SwaggerParser = require("swagger-parser");
let YAML = SwaggerParser.YAML;
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
          this.basePath='';
          this.utils = new Utils();
     }

     createJSON() {
          try {
               
               //Direct json from JsonOject
               this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
               fs.writeFileSync(this.basePath, JSON.stringify(MainJSON.getJSON(), null, 4));

          } catch (error) {
               console.error("Error generating JSON file", error);
               this.utils.writeErrorToFile(error);
          }
     }
     createYAML() {
          let ymlText = YAML.stringify(MainJSON.getJSON());
          this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.yml');
          fs.writeFileSync(this.basePath, ymlText);
     }

     /**
      *
      * 
      * 
      * @memberof FileGenerator
      */
     generate() {
          try {
               console.log("MainJSON",MainJSON.getJSON());
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

                    openAPI.validateSwagger(this.basePath).then(data => {
                         app.toast.info(constant.msgsuccess);
                    })
                    .catch(error => {
                         app.dialogs.showErrorDialog(error.message);
                         console.log(error)
                    });

               } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {
                    let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                    if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {
                         openAPI.validateSwagger(pathValidator).then(data => {
                                   app.dialogs.showAlertDialog(data.message);
                                   console.log(data)
                              })
                              .catch(error => {
                                   app.dialogs.showErrorDialog(error.message);
                                   console.log(error)
                              });
                    } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {
                         openAPI.validateSwagger(pathValidator).then(data => {
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
}

module.exports = FileGenerator;