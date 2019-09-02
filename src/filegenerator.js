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
          try {

               /* Direct json from JsonOject */
               this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
               fs.writeFileSync(this.basePath, JSON.stringify(MainJSON.getJSON(), null, 4));

          } catch (error) {
               console.error("Error generating JSON file", error);
               this.utils.writeErrorToFile(error);
          }
     }

     /**
      * @function createYAML 
      * @description Generate OpenAPI Specs & Writes it in YAML file
      * @memberof FileGenerator
      */
     createYAML() {
          let ymlText = YAML.stringify(MainJSON.getJSON());
          this.basePath = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.yml');
          fs.writeFileSync(this.basePath, ymlText);
     }

     /**
      * @function generate
      * @description Generate OpenAPI Specs in JSON & YAML, JSON or YAML
      * @memberof FileGenerator
      */
     generate() {
          let _this=this;
          try {
               if (openAPI.getFileType() == 1) {
                    this.createJSON();


               } else if (openAPI.getFileType() == 2) {
                    /* Convert JSON object to YAML using j2yaml and save the file */
                    this.createYAML();

               } else {



                    /* Direct conversion from JsonObject to JSON/YAML */

                    /* Direct json from JsonOject */
                    this.createJSON();

                    /* Direct YML from JsonObject */
                    this.createYAML();

               }

               setTimeout(function () {


                    /* Check for APP Mode (APP_MODE_GEN or APP_MODE_TEST) */
                    if (openAPI.getAppMode() == openAPI.APP_MODE_GEN) {
                         /* check for if any error  available or not  */
                         if (openAPI.getError().hasOwnProperty('isWarning') && openAPI.getError().isWarning == true) {
                              app.dialogs.showErrorDialog(openAPI.getError().msg);
                              return;
                         }

                         fs.readFile(_this.basePath, 'utf-8', function (error, data) {
                              if(error){
                              let bindFailureMsg = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                              app.dialogs.showErrorDialog(bindFailureMsg);
                              } else if(data){
                                   parser.validate(_this.basePath, (error, api) => {
                                        let result =null;
                                        if(error){
                                             result = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                             app.dialogs.showErrorDialog(result);
                                        }else {
                                             let bindSuccesMsg = constant.msgsuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + _this.basePath
                                             if (openAPI.getFileType() == 3) {
                                                  let jsonFilePath = _this.basePath.replace(".yml", ".json");
                                                  bindSuccesMsg = bindSuccesMsg + constant.strend + constant.stronlypath + jsonFilePath;
                                             }
                                             app.dialogs.showInfoDialog(bindSuccesMsg);
                                        }
                                   });
                              }
                         });
                         /* openAPI.validateSwagger(this.basePath).then(data => {
                                   let bindSuccesMsg = constant.msgsuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + this.basePath
                                   if (openAPI.getFileType() == 3) {
                                        let jsonFilePath = this.basePath.replace(".yml", ".json");
                                        bindSuccesMsg = bindSuccesMsg + constant.strend + constant.stronlypath + jsonFilePath;
                                   }
                                   app.dialogs.showInfoDialog(bindSuccesMsg);
                              })
                              .catch(error => {
                                   let bindFailureMsg = constant.msgerror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                   app.dialogs.showErrorDialog(bindFailureMsg);
                                   console.log(error)
                              }); */

                    } else if (openAPI.getAppMode() == openAPI.APP_MODE_TEST) {
                         let pathValidator = path.join(openAPI.getFilePath(), openAPI.getUMLPackage().name + '.json');
                         /* Check for TEST Mode (TEST_MODE_SINGLE or TEST_MODE_ALL) */
                         if (openAPI.getTestMode() == openAPI.TEST_MODE_SINGLE) {
                              /* 
                                   openAPI.validateSwagger(pathValidator).then(data => {
                                        let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                        app.dialogs.showInfoDialog(bindSuccesMsg);
                                   })
                                   .catch(error => {
                                        let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        app.dialogs.showErrorDialog(bindFailureMsg);
                                   });

                              */

                              fs.readFile(pathValidator, 'utf-8', function (error, data) {
                                   if (error) {
                                        console.log(error);
                                        result = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                        app.dialogs.showErrorDialog(result);
                                   } else if (data) {
                                        // console.log(data);
                                        parser.validate(pathValidator, (error, api) => {
                                             let result = null;
                                             if (error) {
                                                  result = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                                                  app.dialogs.showErrorDialog(result);
                                             } else {
                                                  result = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                                                  app.dialogs.showInfoDialog(result);
                                             }
                                        });
                                        /* try {
                                   let api = await SwaggerParser.validate(data);
                                   console.log(api);
                              } catch (err) {
                                   console.log(err);
                              } */
                                   }
                              });


                              //       try {
                              //               parser.validate(pathValidator, (err, api) => {
                              //                     console.log(err);
                              //                     if (err) {
                              //                          /* Error */
                              //                          let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                              //                          // app.dialogs.showErrorDialog(bindFailureMsg);

                              //                     } else {
                              //                          /* Success */
                              //                          let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                              //                          // app.dialogs.showInfoDialog(bindSuccesMsg);
                              //                     }
                              //                });
                              //     } catch (err) {
                              //          console.log(err);
                              //     }  

                              // try {



                              //      parser.validate(pathValidator, (err, api) => {
                              //           console.log(err);
                              //           if (err) {
                              //                /* Error */
                              //                let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strerror + error.message
                              //                // app.dialogs.showErrorDialog(bindFailureMsg);

                              //           } else {
                              //                /* Success */
                              //                let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n\n' + constant.strpath + pathValidator
                              //                // app.dialogs.showInfoDialog(bindSuccesMsg);
                              //           }
                              //      });
                              // } catch (err) {
                              //      console.log(err);
                              // }

                         } else if (openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {
                              /* openAPI.validateSwagger(pathValidator).then(data => {
                                        let bindSuccesMsg = constant.msgstestuccess + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strpath + pathValidator
                                        openAPI.addSummery(bindSuccesMsg, 'success');
                                   })
                                   .catch(error => {
                                        let bindFailureMsg = constant.msgtesterror + '\'' + openAPI.getUMLPackage().name + '\' {' + openAPI.getPackagePath() + '}' + '\n' + constant.strerror + error.message
                                        openAPI.addSummery(bindFailureMsg, 'failure');
                                   }); */



                                   fs.readFile(pathValidator, 'utf-8', function (error, data) {
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
                                             /* try {
                                        let api = await SwaggerParser.validate(data);
                                        console.log(api);
                                   } catch (err) {
                                        console.log(err);
                                   } */
                                        }
                                   });
                         }
                    }
               }, 100);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = FileGenerator;