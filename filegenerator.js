const common=require('./common-utils');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
/**
 *
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
          this.utils=new common.Utils();     
     }

     
     /**
      * Return FileGenerator object 
      * 
      * @function getData
      * @return {string}
      */
     generate(codeWriter, fullPath, mainElem, fileType,mainOpenApiObj) {
          try {
               console.log("fileGeneration", fullPath);
               let basePath;
               if (fileType == 1) {
                    /**
                     * Convert yml data to JSON file
                     */
                    

                    try {
                         basePath = path.join(fullPath, mainElem.name + '.json');
                         var doc = yaml.safeLoad(codeWriter.getData());
                         fs.writeFileSync(basePath, JSON.stringify(doc, null, 4));
                         console.log(doc);


                         //Direct json from JsonOject
                         basePath = path.join(fullPath, mainElem.name+"-test" + '.json');
                         fs.writeFileSync(basePath, JSON.stringify(mainOpenApiObj));

                    } catch (error) {
                         console.error("Error generating JSON file", error);
                         this.utils.writeErrorToFile(error,fullPath);
                    }
               } else if (fileType == 2) {
                    /**
                     * Convert data to YML file
                     */

                    basePath = path.join(fullPath, mainElem.name + '.yml');
                    fs.writeFileSync(basePath, codeWriter.getData());
               } else {

                    /**
                     * Convert data to YML file
                     */
                    let basePathYML = path.join(fullPath, mainElem.name + '.yml');
                    fs.writeFileSync(basePathYML, codeWriter.getData());


                    /**
                     * Convert yml data to JSON file
                     */
                    try {
                         basePath = path.join(fullPath, mainElem.name + '.json');
                         var doc = yaml.safeLoad(codeWriter.getData());
                         fs.writeFileSync(basePath, JSON.stringify(doc, null, 4));
                         console.log(doc);
                    } catch (error) {
                         console.error(error);
                         this.utils.writeErrorToFile(error,fullPath);
                    }
               }
               app.toast.info("OpenAPI generation completed");
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error,fullPath);
          }
     }
}

exports.FileGenerator = FileGenerator;