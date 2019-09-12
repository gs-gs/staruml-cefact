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
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: 'JSON file generated successfully'
                    });

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
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: 'YAML file generated successfully'
                    });
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
                         console.log("---json-generate-start");
                         this.createJSON().then(function (result) {
                              console.log("---json-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);
                         });




                    } else if (openAPI.getFileType() == 2) {
                         /* Convert JSON object to YAML using j2yaml and save the file */
                         console.log("---yaml-generate-start");
                         this.createYAML().then(function (result) {
                              console.log("Result", result);
                              console.log("---yaml-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);
                         });

                    } else {

                         /* Direct conversion from JsonObject to JSON/YAML */

                         /* Direct json from JsonOject */
                         console.log("---json-generate-start");
                         this.createJSON().then(function (result) {
                              console.log("Result", result);
                              console.log("---json-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);
                         });

                         /* Direct YML from JsonObject */
                         console.log("---yaml-generate-start");
                         this.createYAML().then(function (result) {
                              console.log("Result", result);
                              console.log("---yaml-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);

                         });

                    }


               } catch (error) {
                    console.error(error);
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
                              /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                              reject(new Error(openAPI.getError().msg));
                         } else {

                              openAPI.validateSwagger(this.basePath).then(data => {
                                        let bindSuccesMsg = constant.msgsuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + this.basePath
                                        if (openAPI.getFileType() == 3) {
                                             let jsonFilePath = this.basePath.replace(".yml", ".json");
                                             bindSuccesMsg = bindSuccesMsg + constant.strend + constant.stronlypath + jsonFilePath;
                                        }
                                        resolve({
                                             result: constant.FIELD_SUCCESS,
                                             message: bindSuccesMsg
                                        });
                                        /*  app.dialogs.showInfoDialog(bindSuccesMsg); */
                                   })
                                   .catch(error => {
                                        let bindFailureMsg = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        /*  app.dialogs.showErrorDialog(bindFailureMsg); */
                                        reject(new Error(bindFailureMsg));
                                   });
                         }

                    } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {

                         let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                         /* Check for TEST Mode (TEST_MODE_SINGLE or TEST_MODE_ALL) */
                         if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {

                              if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                                   /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                                   let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + openAPI.getError().msg;
                                   reject(new Error(bindFailureMsg));
                              } else {


                                   openAPI.validateSwagger(pathValidator).then(data => {
                                             let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                             resolve({
                                                  result: constant.FIELD_SUCCESS,
                                                  message: bindSuccesMsg
                                             });
                                             /*  app.dialogs.showInfoDialog(bindSuccesMsg); */
                                        })
                                        .catch(error => {
                                             let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                             /*  app.dialogs.showErrorDialog(bindFailureMsg); */
                                             reject(new Error(bindFailureMsg));
                                        });
                              }

                         } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {

                              if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                                   /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                                   // reject(new Error(openAPI.getError().msg));

                                   let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + openAPI.getError().msg;

                                   openAPI.addSummery(bindFailureMsg, 'failure');
                                   reject(new Error(openAPI.getError().msg));

                              } else {

                                   openAPI.validateSwagger(pathValidator).then(data => {
                                             let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strpath + pathValidator
                                             openAPI.addSummery(bindSuccesMsg, 'success');
                                             resolve({
                                                  result: constant.FIELD_SUCCESS,
                                                  message: bindSuccesMsg
                                             });

                                        })
                                        .catch(error => {
                                             let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
                                             openAPI.addSummery(bindFailureMsg, 'failure');
                                             reject(new Error(bindFailureMsg));
                                        });
                              }
                         }
                    }
               } catch (error) {
                    reject(error);
               }
          });
     }
}

module.exports = FileGenerator;