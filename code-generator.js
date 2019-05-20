
const fs = require('fs')
const path = require('path')
const codegen = require('./codegen-utils');
var yaml = require('write-yaml');

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

    generate(elem, basePath, options){
        console.log('Code Generator',elem,basePath,options);
        fs.mkdirSync(basePath)
        var i,len
     
        for (i = 0, len = elem.ownedElements.length; i < len; i++) {
            var def = elem.ownedElements[i];
             if (def instanceof  type.UMLPackage) {
                
                this.writeSchema(def,basePath,options);           
            }
        }


      

        // codeWriter.writeLine("info: {description: "+elem.name + ", title:" + elem.name+"}");
        // codeWriter.writeLine("openapi: 3.0.0");
        // codeWriter.writeLine("paths:");
        // codeWriter.indent();

     
    }


    writeSchema( elem, fullPath,options) {
        var basePath = path.join(fullPath, elem.name + '.yml')
        var i,len
        var codeWriter;
      
        codeWriter = new codegen.CodeWriter(this.getIndentString(options))
        codeWriter.writeLine()
        codeWriter.writeLine('components:');
        codeWriter.indent();
        codeWriter.writeLine('schemas:');
        codeWriter.indent();
        console.log(codeWriter.getData().includes('schem'));

        for (i = 0, len = elem.ownedElements.length; i < len; i++) {
            var def = elem.ownedElements[i];
             if (def instanceof type.UMLClass) {
                 console.log(def);
                codeWriter.writeLine(def.name+":");
               
                this.writeProperties(codeWriter,def,options); 
                
               
                
            }
        }
        codeWriter.outdent();
        codeWriter.outdent();

       
        fs.writeFileSync(basePath, codeWriter.getData());       
      
    }


    /**
     * Write Properties
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    writeProperties (codeWriter, elem, options) {

        codeWriter.indent();
        if(elem.attributes.length>0){
            codeWriter.writeLine("properties:");  
            codeWriter.indent();

            var i,len
            for (i = 0, len = elem.attributes.length; i < len; i++) {
                var attr = elem.attributes[i];
                if(attr.multiplicity==="0..*"){
                    codeWriter.writeLine(attr.name+":");
                    codeWriter.indent();
                    codeWriter.writeLine("items: {description: "+attr.documentation+", type: string}");   
                    codeWriter.writeLine("type: array");
                    codeWriter.outdent();  
                }else{
                    codeWriter.writeLine(attr.name+": {description: "+attr.documentation+", type: string}");   
                
                }
            }
            codeWriter.outdent();           
        }
        
        this.writeAssociation(codeWriter,elem,options);   
        
        codeWriter.outdent();  
        if(elem.ownedElements.length>0){
            var data = (this.writeAssociatClass(codeWriter,elem,options)).getData();
            codeWriter.writeLine(data);
        } 
 

    }

    /**
     * Write Association $ref
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    writeAssociation (codeWriter, elem, options) {
        if(elem.ownedElements.length>0){
            codeWriter.indent();
            var i,len
            for (i = 0, len = elem.ownedElements.length; i < len; i++) {
                var assoc = elem.ownedElements[i];
                if (assoc instanceof type.UMLAssociation) {
                    codeWriter.writeLine(assoc.name+": {$ref: '#/components/schemas/"+assoc.end2.reference.name+"'}");  
                } 

            }
            codeWriter.outdent();         
        }
        
    }

    writeAssociatClass(codeWriter,elem,options){

        var i,len
        var subCodeWriter;      
        subCodeWriter = new codegen.CodeWriter(this.getIndentString(options))
        for (i = 0, len = elem.ownedElements.length; i < len; i++) {
            var assocClass = elem.ownedElements[i];    
            if (assocClass instanceof type.UMLAssociation && !(this.stringExistMoreTime(codeWriter.getData(),"{$ref: '#/components/schemas/"+assocClass.end2.reference.name+"'}"))) {
                
                subCodeWriter.indent();
                subCodeWriter.indent();
                subCodeWriter.writeLine(assocClass.end2.reference.name+":");
                
                this.writeProperties(subCodeWriter,assocClass.end2.reference,options); 
            }
        }
        return subCodeWriter;
    }
    

    /**
     * Write Operations(Methods)
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    writeOperation (codeWriter,elem,options){
        if(elem.operations.length>0){
            codeWriter.indent();
            var i,len
            for (i = 0, len = elem.operations.length; i < len; i++) {
                var oper = elem.operations[i];
                codeWriter.writeLine((oper.name).toLowerCase()+":");
                codeWriter.indent();
                codeWriter.writeLine("description: "+oper.documentation+" "+oper.name);
                codeWriter.outdent();
            }
           
        }
        codeWriter.outdent();
    }

    stringExistMoreTime(mainString,searchString){
        var indexof = mainString.indexOf(searchString);
       return ( mainString.indexOf(searchString,(indexof + searchString.length)))>0 ?true : false
    }

}

/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate (baseModel, basePath, options) {
    var codeGenerator = new CodeGenerator(baseModel, basePath);
    codeGenerator.generate(baseModel, basePath, options)
}
  
exports.generate = generate