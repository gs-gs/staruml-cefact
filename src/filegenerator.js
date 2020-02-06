const utils = require('./utils');
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
          utils.resetErrorBlock();
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
                    this.basePath = null;
                    let mainJson = null;
                    this.basePath = path.join(openAPI.getFilePath(), openAPI.getExportElementName() + '.json');
                    mainJson = MainJSON.getJSON();

                    fs.writeFileSync(this.basePath, JSON.stringify(mainJson, null, 4));
                    console.log("file-generate-ended");
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: 'JSON file generated successfully'
                    });

               } catch (error) {

                    console.error("Error generating JSON file", error);
                    utils.writeErrorToFile(error);
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
                    let mainJson = null
                    let filepath = openAPI.getFilePath();
                    let pkgName = openAPI.getExportElementName();
                    mainJson = MainJSON.getJSON();

                    let ymlText = YAML.stringify(mainJson);
                    this.basePath = path.join(filepath, pkgName + '.yml');
                    fs.writeFileSync(this.basePath, ymlText);
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: 'YAML file generated successfully'
                    });
               } catch (error) {

                    console.error("Error generating JSON file", error);
                    utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     }


     /**
      * @function createJSONSchema 
      * @description Generate JSON Schema from ClassDiagra,
      * @memberof FileGenerator
      */
     createJSONSchema() {
          return new Promise((resolve, reject) => {
               try {
                    /* Direct json from JsonOject */
                    console.log("file-generate-started");
                    this.basePath = null;
                    let mainJson = null;
                    this.basePath = path.join(openAPI.getFilePath(), openAPI.getExportElementName() + '.json');
                    mainJson = MainJSON.getJSONSchema();

                    fs.writeFileSync(this.basePath, JSON.stringify(mainJson, null, 4));
                    console.log("file-generate-ended");
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: 'JSON Schema is generated successfully at path : ' + this.basePath
                    });
               } catch (error) {

                    console.error("Error generating JSON file", error);
                    utils.writeErrorToFile(error);
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
               try {
                    let fileType = openAPI.getFileType();

                    if (fileType == constant.FILE_TYPE_JSON) {
                         console.log("---json-generate-start");
                         this.createJSON().then(function (result) {
                              console.log("---json-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);
                         });




                    } else if (fileType == constant.FILE_TYPE_YML) {
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

                    } else if (fileType == constant.FILE_TYPE_JSON_YML) {

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

                    } else if (fileType == constant.FILE_TYPE_JSON_SCHEMA) {
                         /* Direct json from JsonOject */
                         console.log("---jsonschema-generate-start");
                         this.createJSONSchema().then(function (result) {
                              console.log("Result", result);
                              console.log("---json-generate-end");
                              resolve(result);
                         }).catch(function (error) {
                              console.error(error);
                              reject(error);
                         });
                    }


               } catch (error) {
                    console.error(error);
                    utils.writeErrorToFile(error);
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

          return new Promise((resolve, reject) => {

               try {

                    let strModeType = '';
                    if (openAPI.isModelPackage()) {
                         strModeType = ' for Package : ';
                    } else if (openAPI.isModelDiagram()) {
                         strModeType = ' for Diagram : ';
                    }
                    /* Check for APP Mode (APP_MODE_GEN or APP_MODE_TEST) */
                    if (openAPI.getAppMode() == openAPI.APP_MODE_GEN) {
                         /* check for if any error  available or not  */
                         if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                              /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                              reject(new Error(openAPI.getError().msg));
                         } else if (openAPI.getError().hasOwnProperty('isDuplicateProp') && openAPI.getError().isDuplicateProp == true) {
                              /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                              let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n';
                              let errorMsg = openAPI.getError().msg;
                              let strErrorMsg = '';
                              errorMsg.forEach((error) => {
                                   strErrorMsg = strErrorMsg + constant.strerror + error + '\n';
                              });
                              bindFailureMsg = bindFailureMsg + strErrorMsg;
                              reject(new Error(bindFailureMsg));

                         } else {

                              openAPI.validateSwagger(this.basePath).then(data => {
                                        let bindSuccesMsg = constant.msgsuccess + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + this.basePath
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
                                        let bindFailureMsg = constant.msgerror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        /*  app.dialogs.showErrorDialog(bindFailureMsg); */
                                        reject(new Error(bindFailureMsg));
                                   });
                         }

                    } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {

                         let pathValidator = path.join(openAPI.getFilePath(), openAPI.getExportElementName() + '.json');
                         /* Check for TEST Mode (TEST_MODE_SINGLE or TEST_MODE_ALL) */
                         if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {

                              if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                                   /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                                   let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + openAPI.getError().msg;
                                   reject(new Error(bindFailureMsg));

                              } else if (openAPI.getError().hasOwnProperty('isDuplicateProp') && openAPI.getError().isDuplicateProp == true) {
                                   /*  app.dialogs.showErrorDialog(openAPI.getError().msg); */
                                   let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n';
                                   let errorMsg = openAPI.getError().msg;
                                   let strErrorMsg = '';
                                   errorMsg.forEach((error) => {
                                        strErrorMsg = strErrorMsg + constant.strerror + error + '\n';
                                   });
                                   bindFailureMsg = bindFailureMsg + strErrorMsg;
                                   reject(new Error(bindFailureMsg));

                              } else {


                                   openAPI.validateSwagger(pathValidator).then(data => {
                                             let bindSuccesMsg = constant.msgstestuccess + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                             resolve({
                                                  result: constant.FIELD_SUCCESS,
                                                  message: bindSuccesMsg
                                             });
                                             /*  app.dialogs.showInfoDialog(bindSuccesMsg); */
                                        })
                                        .catch(error => {
                                             let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                             /*  app.dialogs.showErrorDialog(bindFailureMsg); */
                                             reject(new Error(bindFailureMsg));
                                        });
                              }

                         } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {

                              if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                                   let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + openAPI.getError().msg;
                                   openAPI.addSummery(bindFailureMsg, 'failure');
                                   reject(new Error(openAPI.getError().msg));

                              } else if (openAPI.getError().hasOwnProperty('isDuplicateProp') && openAPI.getError().isDuplicateProp == true) {
                                   let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n';
                                   let errorMsg = openAPI.getError().msg;
                                   let strErrorMsg = '';
                                   errorMsg.forEach((error) => {
                                        strErrorMsg = strErrorMsg + constant.strerror + error + '\n';
                                   });
                                   bindFailureMsg = bindFailureMsg + strErrorMsg;
                                   openAPI.addSummery(bindFailureMsg, 'failure');
                                   reject(new Error(bindFailureMsg));

                              } else {

                                   openAPI.validateSwagger(pathValidator).then(data => {
                                             let bindSuccesMsg = constant.msgstestuccess + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strpath + pathValidator
                                             openAPI.addSummery(bindSuccesMsg, 'success');
                                             resolve({
                                                  result: constant.FIELD_SUCCESS,
                                                  message: bindSuccesMsg
                                             });

                                        })
                                        .catch(error => {
                                             let bindFailureMsg = constant.msgtesterror + strModeType + '\'' + openAPI.getExportElementName() + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
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

     /**
      * @function createJSONLD
      * @description Generate OpenAPI Specs & Writes it in JSON file
      * @memberof FileGenerator
      */
     createJSONLD(basePath, jsonLD) {
          return new Promise((resolve, reject) => {
               try {

                    fs.writeFileSync(basePath, JSON.stringify(jsonLD, null, 4));
                    resolve({
                         result: constant.FIELD_SUCCESS,
                         message: constant.JSON_LD_SUCCESS_MSG + basePath
                    });

               } catch (error) {

                    console.error("Error generating JSON file", error);
                    utils.writeErrorToFile(error);
                    reject(error);
               }
          });
     }
}

module.exports = FileGenerator;