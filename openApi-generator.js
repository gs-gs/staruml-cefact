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

        // let interReal = app.repository.select("@UMLInterfaceRealization")
        // console.log(interReal);
        // let interGeal = app.repository.select("@UMLGeneralization")
        // console.log(interGeal);
        
       
                
         let _this =this;   
         if (elem instanceof type.UMLPackage) {
            
            if (Array.isArray(elem.ownedElements)) {
              elem.ownedElements.forEach(child => {                
                    if(child instanceof type.UMLClass){
                         setTimeout(function() {  _this.findClass(child,  options); },10);
                       
                    }else if(child instanceof type.UMLInterface){
                        
                        _this.operations.push(child);
                    }
                   
              })
            }

            setTimeout(function() {
                    let resArr = [];
                   _this.schemas.forEach(item => {
                        let filter = resArr.filter(subItem =>{
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


                let uniqArr = [];
                let duplicateClasses =[];

                let isDuplicate = false;
                resArr.forEach(item=>{
                        let filter = uniqArr.filter(subItem=>{
                            return item.name==subItem.name
                        });
                        if(filter.length==0){
                            uniqArr.push(item);
                        }else{
                            isDuplicate = true;
                            duplicateClasses.push(item.name);
                            let firstElem = uniqArr.indexOf(filter[0]);
                            uniqArr[firstElem].attributes = uniqArr[firstElem].attributes.concat(item.attributes);
                            uniqArr[firstElem].ownedElements = uniqArr[firstElem].ownedElements.concat(item.ownedElements);
                        }
                });

                console.log(uniqArr);  
                if(!isDuplicate){
                     _this.writeClass(uniqArr,fullPath, options,elem);
                }else{
                    app.dialogs.showErrorDialog("There "+ (duplicateClasses.length>1?"are":"is") +" duplicate "+ duplicateClasses.join() + (duplicateClasses.length>1?" classes":" class") + " for same name.");                           
                }
             
            },1500);
           
        } 
    }
  

    /**
     * Find Class
     * @param {type.Model} elem
     * @param {Object} options
     */
    findClass(elem, options) {
        let _this =this;  
        _this.schemas.push(elem);
        if (elem.ownedElements.length>0) {
            elem.ownedElements.forEach(child => {                    
                if(child instanceof type.UMLAssociation){
                    // let filter = _this.schemas.filter(function(item){
                    //     return item.name==child.end2.reference.name;
                    // });
                    // if(filter.length<=0){
                        if(child.end1.reference.name!=child.end2.reference.name){
                            setTimeout(function() {   _this.findClass(child.end2.reference,options); },5);
                        }
                    // }                           
                }
            });                   
        }                 
      
    }

  
    /**
     * Write Class (Schema)
     * @param {array} classes
     * @param {string} fullPath for generate yml
     * @param {Object} options
     * @param {type.package} mainElem package element
     */
    writeClass(classes,fullPath, options,mainElem){
        let basePath = path.join(fullPath, mainElem.name + '.yml')
        let codeWriter;
        codeWriter = new codegen.CodeWriter(this.getIndentString(options))
        codeWriter.writeLine('components:');
        codeWriter.indent();
        codeWriter.writeLine('schemas:' + (classes.length==0?" {}":""));
        codeWriter.indent();
        classes.forEach(objClass => {

            let accosElems = objClass.ownedElements.filter(item=>{
                return item instanceof type.UMLAssociation;
            });

            codeWriter.writeLine(objClass.name+":" );  
            codeWriter.indent();
            codeWriter.writeLine("properties:" + ((objClass.attributes.length==0 && accosElems.length==0)?" {}":""));  
            codeWriter.indent();

            let arrAttr = [];

            let i,len;
            for (i = 0, len = objClass.attributes.length; i < len; i++) {
                let attr = objClass.attributes[i];
                let filterAttr = arrAttr.filter(item=>{
                    return item.name==attr.name;
                });
                if(filterAttr.length==0){
                    codeWriter.writeLine(attr.name+":");
                    if(attr.multiplicity==="0..*"){
                        codeWriter.indent();
                        codeWriter.writeLine("items: {description: '"+ (attr.documentation?this.buildDescription(attr.documentation):"missing description")+"', type: "+ this.getType(attr.type)+" }");   
                        codeWriter.writeLine("type: array");
                        codeWriter.outdent();  
                    }else{
                        codeWriter.indent();
                        codeWriter.writeLine("description: '"+(attr.documentation?this.buildDescription(attr.documentation):"missing description")+"'");
                        codeWriter.writeLine("type: "+  this.getType() );
                        if(attr.type instanceof type.UMLEnumeration){
                            codeWriter.writeLine("enum: [" + this.getEnumerationLiteral(attr.type) +"]");                            
                        }

                        codeWriter.outdent(); 
                    }
                    arrAttr.push(attr);
                }
            }


            let arrGeneral = [];

            let arrAssoc = [];
            for (i = 0, len = objClass.ownedElements.length; i < len; i++) {
                let assoc = objClass.ownedElements[i];
                if (assoc instanceof type.UMLAssociation) {
                    let filterAssoc = arrAssoc.filter(item=>{
                        return item.name==assoc.name;
                    });
                    if(filterAssoc.length==0 && assoc.name!=""){

                        if(assoc.end2.multiplicity==="0..*"){
                            codeWriter.writeLine(assoc.name+":");
                            codeWriter.indent();
                            codeWriter.writeLine("items: {$ref: '#/components/schemas/"+assoc.end2.reference.name +"'}");   
                            codeWriter.writeLine("type: array");
                            codeWriter.outdent();
                        }else{
                            codeWriter.writeLine(assoc.name+": {$ref: '#/components/schemas/"+assoc.end2.reference.name +"'}");                            
                        }       
                        arrAssoc.push(assoc); 
                    }                    
                }else if(assoc instanceof type.UMLGeneralization){
                    arrGeneral.push(assoc);
                }
            }


            

            codeWriter.outdent();

            if(arrGeneral.length>0){
                codeWriter.writeLine("allOf:");
                codeWriter.indent();
                arrGeneral.forEach(generalizeClass => {
                   
                    codeWriter.writeLine("- $ref: '#/components/schemas/"+generalizeClass.target.name +"'");
                    codeWriter.writeLine("- type: object");
                });
                codeWriter.outdent();                
            }
           

            codeWriter.outdent();
        });    
        

        codeWriter.outdent();
        codeWriter.outdent();

        codeWriter.writeLine("info: {description: "+mainElem.name+" API - 1.0.0, title: "+ mainElem.name+" API, version: '1.0.0'}")
        codeWriter.writeLine("openapi: 3.0.0");
        codeWriter.writeLine("paths:" + (this.operations.length==0?" {}":""));

       
        this.writeOperation(codeWriter,options,mainElem); 
        codeWriter.writeLine("servers: []");
      
        fs.writeFileSync(basePath, codeWriter.getData());  
    }  

    /**
     * Write Operation (Path)
     * @param {codeWriter} codeWriter
     * @param {Object} options
     * @param {type.package} mainElem package element
     */
    writeOperation(codeWriter,options,mainElem){
        let interReal = app.repository.select("@UMLInterfaceRealization")
        console.log(interReal);
        this.operations.forEach(objOperation => {
                let filterInterface = interReal.filter(itemInterface =>{
                    return itemInterface.target.name == objOperation.name;
                });
                if(filterInterface.length>0){
                    let objInterface = filterInterface[0];
       
                    codeWriter.indent();
                    codeWriter.writeLine("/"+objInterface.target.name+":");
                    codeWriter.indent();
                    objInterface.target.operations.forEach(objOperation =>{
                        if(objOperation.name=="GET"){
                            codeWriter.writeLine("get:");
                            codeWriter.indent();
                            codeWriter.writeLine("description: Get a list of " +objInterface.source.name);
                            codeWriter.writeLine("parameters: []");
                            codeWriter.writeLine("responses:");
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

                            this.buildRequestBody(codeWriter, objInterface);
                        
                            codeWriter.writeLine("responses:");
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
                    });
                    codeWriter.outdent();
                
                    let checkOperationArr = objInterface.target.operations.filter(item => {
                        return item.name=="GET" || item.name=="PUT" || item.name=="DELTE";
                    });

                    if(checkOperationArr.length>0){
                        codeWriter.writeLine("/"+objInterface.target.name+"/{"+objInterface.target.attributes[0].name+"}:");
                        codeWriter.indent();
                        let attr = objInterface.target.attributes[0];
                            
                        objInterface.target.operations.forEach(objOperation => {
                            if(objOperation.name=="GET"){
                                codeWriter.writeLine("get:");
                                codeWriter.indent();
                                codeWriter.writeLine("description: Get single " +objInterface.source.name+" by Id");

                                this.buildParameter(codeWriter,objInterface.target.attributes[0].name,"path",(attr.documentation?this.buildDescription(attr.documentation):"missing description"),true,"{type: string}")

                                codeWriter.writeLine("responses:");
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

                                this.buildParameter(codeWriter,objInterface.target.attributes[0].name,"path",(attr.documentation?this.buildDescription(attr.documentation):"missing description"),true,"{type: string}")
                            
                                codeWriter.writeLine("responses:");
                                codeWriter.indent();
                                codeWriter.writeLine("'204': {description: No Content}");
                                codeWriter.outdent();
                                codeWriter.outdent();
                                
                            
                            }
                            else  if(objOperation.name=="PUT"){
                                codeWriter.writeLine("put:");
                                codeWriter.indent();
                                codeWriter.writeLine("description: Update an existing " +objInterface.source.name);
                            
                                this.buildParameter(codeWriter,objInterface.target.attributes[0].name,"path",(attr.documentation?this.buildDescription(attr.documentation):"missing description"),true,"{type: string}")

                                codeWriter.writeLine("responses:");
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
                    }
                codeWriter.outdent();
                codeWriter.outdent();  
                }     
        });
    }

    /**
     * Description replace (') with ('')
     * @param {string} desc
     */
    buildDescription(desc){
        return desc.replace(/\'/g, "''")
    }

    buildParameter(codeWriter, name,  type,  description,  required,  schema) {
        codeWriter.writeLine("parameters:");
        codeWriter.writeLine("- description: " + description);
        codeWriter.indent();
        codeWriter.writeLine("in: " + type);
        codeWriter.writeLine("name: "+name);
        codeWriter.writeLine("required: " + required);
        codeWriter.writeLine("schema: " + schema);
        codeWriter.outdent();
    }

     buildRequestBody(codeWriter, objInterface) {
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
    }


    getEnumerationLiteral(objEnum){
        let result = objEnum.literals.map(a => a.name);
        return (result);
    }
  
    
}

exports.OpenApiGenerator = OpenApiGenerator;
