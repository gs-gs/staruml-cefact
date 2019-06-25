
const fs = require('fs')
const openApiGen = require('./openApi-generator');

class CodeGenerator {

    
    constructor(baseModel, basePath,options) {
         this.baseModel = baseModel;
         this.basePath = basePath;
         this.options = options;
    }

    /**
     * Return Indent String based on options
     * @param {Object} options
     * @return {string}
     */
    getIndentString() {
         return this.options.useTab ?
              "\t" :
              this.options.indentSpaces.map(() => " ").join("");

    }

    generate(fileType) {
         try {
              fs.mkdirSync(this.basePath);
              const schemaWriter = new openApiGen.OpenApiGenerator();
              if (this.baseModel instanceof type.UMLPackage) {
                   schemaWriter.generate(
                        this.basePath,
                        this.baseModel,
                        this.options,
                        fileType
                   );
              } else {
                   this.baseModel.ownedElements.forEach(element => {
                        if (element instanceof type.UMLPackage) {
                             schemaWriter.generate(
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
/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate(baseModel, basePath, options, fileType) {
     const codeGenerator = new CodeGenerator(baseModel, basePath, options);
     codeGenerator.generate(fileType);
}

exports.generate = generate