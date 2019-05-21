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
    this.operations = [];
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

    getType(starUMLType) {
        if (starUMLType==="Numeric") {
            return "number";
        } else if (starUMLType==="Indicator") {
            return "boolean";
        } else return "string";
    }

    generate(fullPath,elem,options){
       
                
         var _this =this;   
         if (elem instanceof type.UMLPackage) {
            
            if (Array.isArray(elem.ownedElements)) {
              elem.ownedElements.forEach(child => {                
                    if(child instanceof type.UMLClass){
                         setTimeout(function() {  _this.findClass(child,  options); },10);
                       
                    }
                   
              })
            }

            setTimeout(function() {
                    var resArr = [];
                   _this.schemas.forEach(item => {
                        var filter = resArr.filter(subItem =>{
                            return subItem._id==item._id;
                        })
                        if(filter.length==0){
                             resArr.push(item);
                        }
                   });
      
                resArr.sort(function(a, b) {                     
                    return a.name.localeCompare(b.name);
                });

                console.log(resArr);


                var uniqArr = [];

                var isDuplicate = false;
                resArr.forEach(item=>{
                        var filter = uniqArr.filter(subItem=>{
                            return item.name==subItem.name
                        });
                        if(filter.length==0){
                            uniqArr.push(item);
                        }else{
                            isDuplicate = true;
                            
                            // var firstElem = uniqArr.indexOf(filter[0]);
                            // uniqArr[firstElem].attributes = uniqArr[firstElem].attributes.concat(item.attributes);
                            // uniqArr[firstElem].ownedElements = uniqArr[firstElem].attributes.concat(item.ownedElements);
                        }
                });

                // console.log(uniqArr);  
                if(!isDuplicate){
                     _this.writeClass(resArr,fullPath, options,elem);
                }else{
                    app.dialogs.showErrorDialog("There is duplicate class for same name.");                           
                }
             
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
                             // var filter = _this.schemas.filter(function(item){
                            //     return item.name==child.end2.reference.name;
                            // });
                            // if(filter.length<=0){
                                setTimeout(function() {   _this.findClass(child.end2.reference,options); },5);
                            // }

                            //  filter = _this.schemas.filter(function(item){
                            //     return item.name==child.end1.reference.name;
                            // });
                            // if(filter.length<=0){
                            //     setTimeout(function() {   _this.findClass(child.end1.reference,options); },10);
                            // }
                        }
                    });

                    // elem.ownedElements.forEach(child => {                    
                    //     if(child instanceof type.UMLAssociation){
                            

                    //         var filter = _this.schemas.filter(function(item){
                    //             return item.name==child.end1.reference.name;
                    //         });
                    //         if(filter.length<=0){
                    //             setTimeout(function() {   _this.findClass(child.end1.reference,options); },10);
                    //         }
                    //     }
                    // })
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
            codeWriter.writeLine(objClass.name+":" );  
            codeWriter.indent();
            codeWriter.writeLine("properties:");  
            codeWriter.indent();

            var arrAttr = [];

            var i,len;
            for (i = 0, len = objClass.attributes.length; i < len; i++) {
                var attr = objClass.attributes[i];
                var filterAttr = arrAttr.filter(item=>{
                    return item.name==attr.name;
                });
                if(filterAttr.length==0){

                    if(attr.multiplicity==="0..*"){
                        codeWriter.writeLine(attr.name+":");
                        codeWriter.indent();
                        codeWriter.writeLine("items: {description: '"+ (attr.documentation?attr.documentation:"missing description")+"', type:"+ this.getType()+" }");   
                        codeWriter.writeLine("type: array");
                        codeWriter.outdent();  
                    }else{
                        codeWriter.writeLine(attr.name+": {description: '"+(attr.documentation?attr.documentation:"missing description")+"', type:"+  this.getType() +" }");   
                    
                    }
                    arrAttr.push(attr);
                }
            }

            var arrAssoc = [];
            for (i = 0, len = objClass.ownedElements.length; i < len; i++) {
                var assoc = objClass.ownedElements[i];
                var filterAssoc = arrAssoc.filter(item=>{
                    return item.name==assoc.name;
                });
                if(filterAssoc.length==0){
                    if (assoc instanceof type.UMLAssociation) {
                        codeWriter.writeLine(assoc.name+": {$ref: '#/components/schemas/"+assoc.end2.reference.name+"_"+ assoc.end2.reference._id +"'}");  
                    } 
                    arrAssoc.push(assoc);
                }
            }

            codeWriter.outdent();
            codeWriter.outdent();
        });    
        
        
        

        codeWriter.outdent();
        codeWriter.outdent();

        codeWriter.writeLine("info: {description: "+mainElem.name+" API - 1.0.0, title: "+ mainElem.name+" API, version: '1.0.0'}")
        codeWriter.writeLine("openapi: 3.0.0");
        codeWriter.writeLine("paths:" + (this.operations.length==0?" {}":""));

        this.writeOperation(codeWriter,options,mainElem);


        
        fs.writeFileSync(basePath, codeWriter.getData());  
    }  

    writeOperation(codeWriter,options,mainElem){
        var interReal = app.repository.select(mainElem.name+"::@UMLInterfaceRealization")
        console.log(interReal);

        interReal.forEach(objInterface => {
            codeWriter.indent();
            codeWriter.writeLine("/"+objInterface.target.name+":");
            codeWriter.indent();
            objInterface.target.operations.forEach(objOperation => {
                if(objOperation.name=="GET"){
                    codeWriter.writeLine("get:");
                    codeWriter.indent();
                    codeWriter.writeLine("description: Get a list of " +objInterface.source.name);
                    codeWriter.writeLine("parameters: []");
                    codeWriter.writeLine("response:");
                    codeWriter.indent();
                    codeWriter.writeLine("'200':");
                    codeWriter.indent();
                    codeWriter.writeLine("content:");
                    codeWriter.indent();
                    codeWriter.writeLine("application/json:");
                    codeWriter.indent();
                    codeWriter.writeLine("schema:"); 
                    codeWriter.indent();
                    codeWriter.writeLine("items: {$ref: '#/components/schemas/"+objInterface.source.name+"'}");
                    codeWriter.writeLine("type: array");   
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.writeLine("description: OK");
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.outdent();
                   
                }
                else if(objOperation.name=="POST"){
                    codeWriter.writeLine("post:");
                    codeWriter.indent();
                    codeWriter.writeLine("description:  Create a new " +objInterface.source.name);

                    codeWriter.writeLine('requestBody:');
                    codeWriter.indent();
                    codeWriter.writeLine("content:");
                    codeWriter.indent();
                    codeWriter.writeLine("application/json:");
                    codeWriter.indent();
                    codeWriter.writeLine("schema: {$ref: '#/components/schemas/"+objInterface.source.name+"'}"); 
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.writeLine("description: ''");
                    codeWriter.writeLine("required: true");
                    codeWriter.outdent();

                    codeWriter.writeLine("response:");
                    codeWriter.indent();
                    codeWriter.writeLine("'201':");
                    codeWriter.indent();
                    codeWriter.writeLine("content:");
                    codeWriter.indent();
                    codeWriter.writeLine("application/json:");
                    codeWriter.indent();
                    codeWriter.writeLine("schema: {$ref: '#/components/schemas/"+objInterface.source.name+"'}"); 
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.writeLine("description: Created");
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.outdent();
                   
                }
            })
            codeWriter.outdent();
           
            codeWriter.writeLine("/"+objInterface.target.name+"/{"+objInterface.target.attributes[0].name+"}:");
            codeWriter.indent();
            objInterface.target.operations.forEach(objOperation => {
                if(objOperation.name=="GET"){
                    codeWriter.writeLine("get:");
                    codeWriter.indent();
                    codeWriter.writeLine("description: Get single " +objInterface.source.name+" by Id");

                    codeWriter.writeLine("parameters:");
                    codeWriter.writeLine("- description:");
                    codeWriter.indent();
                    codeWriter.writeLine("in: path");
                    codeWriter.writeLine("name: "+objInterface.target.attributes[0].name);
                    codeWriter.writeLine("required: true");
                    codeWriter.writeLine("schema: {type: string}");
                    codeWriter.outdent();


                    codeWriter.writeLine("response:");
                    codeWriter.indent();
                    codeWriter.writeLine("'200':");
                    codeWriter.indent();
                    codeWriter.writeLine("content:");
                    codeWriter.indent();
                    codeWriter.writeLine("application/json:");
                    codeWriter.indent();
                    codeWriter.writeLine("schema: {$ref: '#/components/schemas/"+ objInterface.source.name +"'}"); 
                   
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.writeLine("description: OK");
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.outdent();
                   
                }
                else  if(objOperation.name=="DELETE"){
                    codeWriter.writeLine("delete:");
                    codeWriter.indent();
                    codeWriter.writeLine("description: Delete an existing " +objInterface.source.name);

                    codeWriter.writeLine("parameters:");
                    codeWriter.writeLine("- description:");
                    codeWriter.indent();
                    codeWriter.writeLine("in: path");
                    codeWriter.writeLine("name: "+objInterface.target.attributes[0].name);
                    codeWriter.writeLine("required: true");
                    codeWriter.writeLine("schema: {type: string}");
                    codeWriter.outdent();


                    codeWriter.writeLine("response:");
                    codeWriter.indent();
                    codeWriter.writeLine("'204': {description: No Content}");
                   codeWriter.outdent();
                    codeWriter.outdent();
                    
                   
                }
                else  if(objOperation.name=="PUT"){
                    codeWriter.writeLine("put:");
                    codeWriter.indent();
                    codeWriter.writeLine("description: Update an existing " +objInterface.source.name);

                    codeWriter.writeLine("parameters:");
                    codeWriter.writeLine("- description: id parameter");
                    codeWriter.indent();
                    codeWriter.writeLine("in: path");
                    codeWriter.writeLine("name: "+objInterface.target.attributes[0].name);
                    codeWriter.writeLine("required: true");
                    codeWriter.writeLine("schema: {type: string}");
                    codeWriter.outdent();


                    codeWriter.writeLine("response:");
                    codeWriter.indent();
                    codeWriter.writeLine("'200':");
                    codeWriter.indent();
                    codeWriter.writeLine("content:");
                    codeWriter.indent();
                    codeWriter.writeLine("application/json:");
                    codeWriter.indent();
                    codeWriter.writeLine("schema: {$ref: '#/components/schemas/"+ objInterface.source.name +"'}");
                    codeWriter.outdent();
                    codeWriter.outdent();
                    codeWriter.writeLine("description: OK");
                   
                    codeWriter.outdent();
                    
                   codeWriter.outdent();
                    codeWriter.outdent();
                    
                   
                }
            });
            codeWriter.outdent();
            codeWriter.outdent();       
        });
    }
    
}



exports.OpenApiGenerator = OpenApiGenerator;
