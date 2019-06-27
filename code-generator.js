const fs = require('fs')
const openApiGen = require('./openApi-generator');
/**
 *
 *
 * @class CodeGenerator
 */
class CodeGenerator {

     /**
      * Creates an instance of CodeGenerator.
      * 
      * @constructor CodeGenerator
      * @param {UMLPackage} baseModel
      * @param {string} basePath
      * @param {Object} options
      */
     constructor(baseModel, basePath, options) {
          this.baseModel = baseModel;
          this.basePath = basePath;
          this.options = options;
     }

     /**
      * Generates file as user have selected fileType (JSON, YML, BOTH)
      *
      * @function generate
      * @param {string} fileType
      */
     generate(fileType) {
          try {
               fs.mkdirSync(this.basePath);
               const schemaWriter = new openApiGen.OpenApiGenerator();
               if (this.baseModel instanceof type.UMLPackage) {
                    schemaWriter.generateOpenApi(
                         this.basePath,
                         this.baseModel,
                         this.options,
                         fileType
                    );
               } else {
                    this.baseModel.ownedElements.forEach(element => {
                         if (element instanceof type.UMLPackage) {
                              schemaWriter.generateOpenApi(
                                   this.basePath,
                                   element,
                                   this.options,
                                   fileType
                              );
                         }
                    });
               }
          } catch (_e) {
               app.toast.error("Generation Failed!");
          }
     }

}


/**
 * Creates instance of this module and generates file
 *
 * @function generate
 * @param {UMLPackage} baseModel
 * @param {string} basePath
 * @param {Object} options
 * @param {string} fileType
 */
function generate(baseModel, basePath, options, fileType) {
     const codeGenerator = new CodeGenerator(baseModel, basePath, options);
     codeGenerator.generate(fileType);
}

exports.generate = generate