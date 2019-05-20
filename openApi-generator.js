const fs = require('fs')
const path = require('path')
const codegen = require('./codegen-utils');

class OpenApiGenerator {

     /**
   * @constructor
   */
  constructor () {
    /** @member {Array.<string>} schemas */
    this.schemas = [];
    
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

    generate(fullPath,elem,options){
        console.log('OPen API Generator',elem);
        var basePath = path.join(fullPath, elem.name + '.yml')
        var i,len
        var codeWriter;
        codeWriter = new codegen.CodeWriter(this.getIndentString(options));
        codeWriter.writeLine()
            codeWriter.writeLine('components:');
            codeWriter.indent();
            codeWriter.writeLine('schemas:');
            codeWriter.indent();

            for (i = 0, len = elem.ownedElements.length; i < len; i++) {
                var def = elem.ownedElements[i];
               
                if (def instanceof type.UMLClass) {
                    // codeWriter.writeLine(def.name+":");               
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
        try{

            var filterClass = this.schemas.filter(function(item){
                return item==elem.name;
            });
            if(filterClass.length==0){
                codeWriter.writeLine(elem.name+":");  
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

                if( elem.ownedElements.length>0){
                    this.writeAssociatClass(codeWriter,elem,options);
                } 
                this.schemas.push(elem.name);
            }
            
        }catch(error){
            console.log("writeProperties Error ",error);
        }

    }

    /**
     * Write Association $ref
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    writeAssociation (codeWriter, elem, options) {
        try{
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
        }catch(error){
            console.log("writeAssociation Error ",error);
        }
        
    }

    writeAssociatClass(codeWriter,elem,options){
        try{
            var i,len;
            for (i = 0, len = elem.ownedElements.length; i < len; i++) {
                var assocClass = elem.ownedElements[i];  
            

                if (assocClass instanceof type.UMLAssociation ) {
                    // && !(this.stringExistMoreTime(codeWriter.getData(),"{$ref: '#/components/schemas/"+assocClass.end2.reference.name+"'}"))
                    // codeWriter.writeLine(assocClass.end2.reference.name+":");

                    var filterClass = this.schemas.filter(function(item){
                        return item==assocClass.end2.reference.name;
                    });
                    if(filterClass.length==0){
                        this.writeProperties(codeWriter,assocClass.end2.reference,options); 
                    }

                    // filterClass = this.schemas.filter(function(item){
                    //     return item==assocClass.end1.reference.name;
                    // });
                    // if(filterClass.length==0){
                    //     this.writeProperties(codeWriter,assocClass.end1.reference,options,true); 
                    // }
                }
            }

            

        }catch(error){
            console.log("writeAssociatClass Error ",error);
        }
    }

}



exports.OpenApiGenerator = OpenApiGenerator;
