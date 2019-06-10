
const fs = require('fs')
const openApiGen = require('./openApi-generator');

class CodeGenerator {

     /**
     * @constructor
     *
     * @param {type.UMLPackage} baseModel
     * @param {string} basePath generated files and directories to be placed
     */
    constructor (baseModel, basePath) {
        /** @member {type.Model} */
        this.baseModel = baseModel
    
        /** @member {string} */
        this.basePath = basePath
    }

    /**
     * Return Indent String based on options
     * @param {Object} options
     * @return {string}
     */
    getIndentString (options) {
        if (options.useTab) {
        return '\t'
        } else {
        var i
        var len
        var indent = []
        for (i = 0, len = options.indentSpaces; i < len; i++) {
            indent.push(' ')
        }
        return indent.join('')
        }
    }

    generate(elem, basePath, options,fileType){
        try{
            if (elem instanceof  type.UMLPackage) {
                fs.mkdirSync(basePath)
                let schemaWriter = new openApiGen.OpenApiGenerator(); 
                schemaWriter.generate(basePath,elem,options,fileType);
            }
            else{
                fs.mkdirSync(basePath);
                let i,len
            
                for (i = 0, len = elem.ownedElements.length; i < len; i++) {
                    let def = elem.ownedElements[i];
                    if (def instanceof  type.UMLPackage) {
                        let schemaWriter = new openApiGen.OpenApiGenerator(); 
                        schemaWriter.generate(basePath,def,options,fileType);      
                    }
                }   
            }  
            app.toast.info("OpenAPI generation completed");
        } catch (e) {
          app.toast.error("Generation Failed!");
        }   
    }
   
}

/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate (baseModel, basePath, options,fileType) {
    var codeGenerator = new CodeGenerator(baseModel, basePath);
    codeGenerator.generate(baseModel, basePath, options,fileType)
}
  
exports.generate = generate