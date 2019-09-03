const Utils = require('./utils');
const fs = require('fs');
const path = require('path');
const openAPI = require('./openapi');
const MainJSON = require('./mainjson');
const constant = require('./constant');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
let YAML = SwaggerParser.YAML;

/**
 * @class FileGenerator 
 * @description class generate JSON, YAML file based of selection
 */
class FileGenerator {
     /**
      * @constructor Creates an instance of FileGenerator.
      */
     constructor() {
          this.basePath = '';
          this.utils = new Utils();
     }

     /**
      * @function createJSON
      * @description Generate OpenAPI Specs & Writes it in JSON file
      * @memberof FileGenerator
      */
     createJSON() {
          return new Promise((resolve, reject) => {
               try {

                    /* Direct json from JsonOject */
                    console.log("file-generate-started");
                    this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                    fs.writeFileSync(this.basePath, JSON.stringify(MainJSON.getJSON(), null, 4));
                    console.log("file-generate-ended");
                    resolve("success-createJSON");

               } catch (error) {

                    console.error("Error generating JSON file", error);
                    this.utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     }

     /**
      * @function createYAML 
      * @description Generate OpenAPI Specs & Writes it in YAML file
      * @memberof FileGenerator
      */
     createYAML() {
          return new Promise((resolve, reject) => {
               try {
                    let ymlText = YAML.stringify(MainJSON.getJSON());
                    this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.yml');
                    fs.writeFileSync(this.basePath, ymlText);
                    resolve("success-createYAML");
               } catch (error) {

                    console.error("Error generating JSON file", error);
                    this.utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     }

     /**
      * @function generate
      * @description Generate OpenAPI Specs in JSON & YAML, JSON or YAML
      * @memberof FileGenerator
      */
     generate() {
          return new Promise((resolve, reject) => {
               let _this = this;
               try {
                    if (openAPI.getFileType() == 1) {
                         console.log("---f-start");
                         this.createJSON().then(function (result) {
                              console.log("Result", result);
                              console.log("---f-end");
                              resolve("success-generate");
                         }).catch(function (error) {
                              reject(error);
                         });




                    } else if (openAPI.getFileType() == 2) {
                         /* Convert JSON object to YAML using j2yaml and save the file */
                         console.log("---f-start");
                         this.createYAML().then(function (result) {
                              console.log("Result", result);
                              console.log("---f-end");
                              resolve("success-generate");
                         }).catch(function (error) {
                              reject(error);
                         });
                         console.log("---f-end");

                    } else {



                         /* Direct conversion from JsonObject to JSON/YAML */

                         /* Direct json from JsonOject */
                         console.log("---f-start-1");
                         this.createJSON().then(function (result) {
                              console.log("Result", result);
                              console.log("---f-end-1");
                              resolve("success-generate");
                         }).catch(function (error) {
                              reject(error);
                         });

                         /* Direct YML from JsonObject */
                         console.log("---f-start");
                         this.createYAML().then(function (result) {
                              console.log("Result", result);
                              console.log("---f-end");
                              resolve("success-generate");
                         }).catch(function (error) {
                              reject(error);
                         });
                         console.log("---f-end");

                    }


               } catch (error) {
                    console.error("Found error", error.message);
                    this.utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     }

     /**
      * @function validateAndPrompt
      * @description Validate generated OpenApi using swagger parser and returns promise result
      * @returns 
      * @memberof FileGenerator
      */
     validateAndPrompt() {
          let _this = this;
          return new Promise((resolve, reject) => {

               try {
                    /* Check for APP Mode (APP_MODE_GEN or APP_MODE_TEST) */
                    if (openAPI.getAppMode() == openAPI.APP_MODE_GEN) {
                         /* check for if any error  available or not  */
                         if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                              let error = {
                                   error: openAPI.getError.msg
                              };
                              reject(error);
                              app.dialogs.showErrorDialog(openAPI.getError().msg);
                              // return;
                         }

                         /* fs.readFile(_this.basePath, 'utf-8', function (error, data) {
                              if (error) {
                                   let bindFailureMsg = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                   app.dialogs.showErrorDialog(bindFailureMsg);
                              } else if (data) {
                                   parser.validate(_this.basePath, (error, api) => {
                                        let result = null;
                                        if (error) {
                                             result = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                             app.dialogs.showErrorDialog(result);
                                        } else {
                                             let bindSuccesMsg = constant.msgsuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + _this.basePath
                                             if (openAPI.getFileType() == 3) {
                                                  let jsonFilePath = _this.basePath.replace(".yml", ".json");
                                                  bindSuccesMsg = bindSuccesMsg + constant.strend + constant.stronlypath + jsonFilePath;
                                             }
                                             app.dialogs.showInfoDialog(bindSuccesMsg);
                                        }
                                   });
                              }
                         }); */
                         openAPI.validateSwagger(this.basePath).then(data => {
                                   let bindSuccesMsg = constant.msgsuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + this.basePath
                                   if (openAPI.getFileType() == 3) {
                                        let jsonFilePath = this.basePath.replace(".yml", ".json");
                                        bindSuccesMsg = bindSuccesMsg + constant.strend + constant.stronlypath + jsonFilePath;
                                   }
                                   let success = {
                                        success: bindSuccesMsg
                                   };
                                   resolve(success);
                                   app.dialogs.showInfoDialog(bindSuccesMsg);
                              })
                              .catch(error => {
                                   let bindFailureMsg = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                   let errorObj = {
                                        error: bindFailureMsg
                                   };
                                   reject(errorObj);
                                   console.log(error)
                                   app.dialogs.showErrorDialog(bindFailureMsg);
                              });

                    } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {
                         let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                         /* Check for TEST Mode (TEST_MODE_SINGLE or TEST_MODE_ALL) */
                         if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {

                              openAPI.validateSwagger(pathValidator).then(data => {
                                        let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                        let success = {
                                             success: bindSuccesMsg
                                        };
                                        resolve(success);
                                        app.dialogs.showInfoDialog(bindSuccesMsg);
                                   })
                                   .catch(error => {
                                        let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        let errorObj = {
                                             error: bindFailureMsg
                                        };
                                        reject(errorObj);
                                        app.dialogs.showErrorDialog(bindFailureMsg);
                                   });



                              /* fs.readFile(pathValidator, 'utf-8', function (error, data) {
                                   console.log("error---1", error);
                                   console.log("error---1", data);
                                   // console.log(data);
                                   if (error) {
                                        let result = null;
                                        console.log(error);
                                        result = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        app.dialogs.showErrorDialog(result);
                                   } else if (data) {
                                        // console.log(data);
                                        parser.validate(pathValidator, (error, api) => {
                                             console.log("error---2", error);
                                             console.log("error---2", api);
                                             let result = null;
                                             if (error) {
                                                  result = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                                  app.dialogs.showErrorDialog(result);
                                             } else {
                                                  result = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                                  app.dialogs.showInfoDialog(result);
                                             }
                                        });
                                        
                                   }
                              }); */

                         } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {

                              /* fs.readFile(pathValidator, 'utf-8', function (error, data) {
                                   if (error) {
                                        console.log(error);
                                        let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
                                        openAPI.addSummery(bindFailureMsg, 'failure');
                                   } else if (data) {
                                        // console.log(data);
                                        parser.validate(pathValidator, (error, api) => {
                                             if (error) {
                                                  let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
                                                  openAPI.addSummery(bindFailureMsg, 'failure');
                                             } else {
                                                  let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strpath + pathValidator
                                                  openAPI.addSummery(bindSuccesMsg, 'success');
                                             }
                                        });
                                       
                                   }
                              }); */

                              openAPI.validateSwagger(pathValidator).then(data => {
                                        let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strpath + pathValidator
                                        openAPI.addSummery(bindSuccesMsg, 'success');
                                        let success = {
                                             success: bindSuccesMsg
                                        };
                                        resolve(success);

                                   })
                                   .catch(error => {
                                        let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
                                        openAPI.addSummery(bindFailureMsg, 'failure');
                                        let errorObj = {
                                             error: bindFailureMsg
                                        };
                                        reject(errorObj);
                                   });
                         }
                    }
               } catch (error) {
                    reject(error);
               }
          });
     }
}

module.exports = FileGenerator;