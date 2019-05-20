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
         var _this =this;   
         if (elem instanceof type.UMLPackage) {
            
            if (Array.isArray(elem.ownedElements)) {
              elem.ownedElements.forEach(child => {                
                    if(child instanceof type.UMLClass){
                        console.log(child);
                        setTimeout(function() {  _this.findClass(child,  options); },10);
                       
                    }
              })
            }

            setTimeout(function() {
                console.log(_this.schemas);      

                    var resArr = [];
                   _this.schemas.forEach(item => {
                        var filter = resArr.filter(subItem =>{
                            return subItem.name==item.name;
                        })
                        if(filter.length==0){
                        resArr.push(item);
                        }
                   });
                   
                   _this.writeClass(resArr,fullPath, options,elem);
                  
            },1000);
           
          } 
    }


  

    /**
     * Write Properties
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    findClass ( elem, options) {
        var _this =this;  
        _this.schemas.push(elem);
                if (elem.ownedElements.length>0) {
                    elem.ownedElements.forEach(child => {                    
                        if(child instanceof type.UMLAssociation){
                            console.log("Child Class");
                            var filter = _this.schemas.filter(function(item){
                                return item.name==child.end2.reference.name;
                            });
                            if(filter.length<=0){
                                setTimeout(function() {   _this.findClass(child.end2.reference,options); },10);
                            }

                             filter = _this.schemas.filter(function(item){
                                return item.name==child.end1.reference.name;
                            });
                            if(filter.length<=0){
                                setTimeout(function() {   _this.findClass(child.end1.reference,options); },10);
                            }
                        }
                    })
                }                   
      
    }

    writeClass(classes,fullPath, options,mainElem){
        var basePath = path.join(fullPath, mainElem.name + '.yml')
        var codeWriter;
        codeWriter = new codegen.CodeWriter(this.getIndentString(options))
        codeWriter.writeLine()
        codeWriter.writeLine('components:');
        codeWriter.indent();
        codeWriter.writeLine('schemas:');
        codeWriter.indent();
        classes.forEach(objClass => {
            codeWriter.writeLine(objClass.name+":");  
            codeWriter.indent();
            codeWriter.writeLine("properties:");  
            codeWriter.indent();

            var i,len
            for (i = 0, len = objClass.attributes.length; i < len; i++) {
                var attr = objClass.attributes[i];
                if(attr.multiplicity==="0..*"){
                    codeWriter.writeLine(attr.name+":");
                    codeWriter.indent();
                    codeWriter.writeLine("items: {description: '"+attr.documentation+"', type: string}");   
                    codeWriter.writeLine("type: array");
                    codeWriter.outdent();  
                }else{
                    codeWriter.writeLine(attr.name+": {description: '"+attr.documentation+"', type: string}");   
                
                }
            }

             for (i = 0, len = objClass.ownedElements.length; i < len; i++) {
                var assoc = objClass.ownedElements[i];
                if (assoc instanceof type.UMLAssociation) {
                    codeWriter.writeLine(assoc.name+": {$ref: '#/components/schemas/"+assoc.end2.reference.name+"'}");  
                } 

            }



            codeWriter.outdent();
            codeWriter.outdent();
        });     
        codeWriter.outdent();
        codeWriter.outdent();
        
        fs.writeFileSync(basePath, codeWriter.getData());  
    }

   
    

}



exports.OpenApiGenerator = OpenApiGenerator;
