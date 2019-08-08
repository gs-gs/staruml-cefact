const Utils = require('../utils');
const fs = require('fs');
const path = require('path');
const testOpenApi = require('./testopenapi');
const MainJSON = require('../mainjson');
const constant = require('../constant');

/**
 * TestFileGenerator class generate JSON, YAML file based of selection
 *
 * @class TestFileGenerator
 */
class TestFileGenerator {
     /**
      * Creates an instance of TestFileGenerator.
      * 
      * @constructor TestFileGenerator
      */
     constructor() {
          this.utils = new Utils();
     }
     /**
      * @function createJSON
      * @description This function creats OpenAPI json file at Selected file path
      * @memberof TestFileGenerator
      */
     createJSON() {
          try {
               let basePath;
               //Direct json from JsonOject
               basePath = path.join(testOpenApi.getFilePath(), constant.IDEAL_JSON_FILE_NAME);
               fs.writeFileSync(basePath, JSON.stringify(MainJSON.getJSON(), null, 4));

          } catch (error) {
               console.error("Error generating JSON file", error);
               this.utils.writeErrorToFile(error);
          }
     }


     /**
      *
      * @function generate
      * @description Function generate OpenAPI file for testing purpose
      * @memberof TestFileGenerator
      */
     generate() {
          try {

               this.createJSON();

               app.toast.info(constant.msgsuccess);
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = TestFileGenerator;