const Utils=require('./utils');
const openAPI=require('./openapi');
const Generalization =require('./generalization');
/**
 *
 *
 * @class Paths
 */
class Paths {
     /**
      * Creates an instance of Paths.
      * 
      * @constructor Paths
      */
     constructor() {
          this.utils=new Utils();  
          this.generalization=new Generalization();  
     }

     /**
      * Return Operations object 
      * 
      * @function getData
      * @return {string}
      */
     getOperations() {
          let mainPathsObject={};
          
          try {
               let interReal = app.repository.select("@UMLInterfaceRealization");
               openAPI.getPaths().forEach(objOperation => {
                    
                    let filterInterface = interReal.filter(itemInterface => {
                         return itemInterface.target.name == objOperation.name;
                    });

                    if (filterInterface.length > 0) {
                         

                         let objInterface = filterInterface[0];

                         let interfaceAssociation = app.repository.select(objInterface.target.name + "::@UMLAssociation");
                         let filterInterfaceAssociation = interfaceAssociation.filter(item => {
                              return item.end2.aggregation == "composite";
                         });

                         if (filterInterfaceAssociation.length == 0) {
                              let pathsObject={};
                              mainPathsObject["/" + objInterface.target.name]=pathsObject;


                              objInterface.target.operations.forEach(objOperation => {
                                   let wOperationObject={};
                                   
                                   if (objOperation.name.toUpperCase() == "GET") {
                                        console.log("---WO-1-get","/" + objInterface.target.name);
                                        pathsObject.get=wOperationObject;

                                        let tagsArray=[];
                                        

                                        wOperationObject.tags=tagsArray;

                                        tagsArray.push(objInterface.target.name);

                                        
                                        wOperationObject.description='Get a list of '+objInterface.source.name;

                                        let parametersArray=[];
                                        wOperationObject.parameters=parametersArray;
                                        // codeWriter.writeLine("parameters: " + (objOperation.parameters.filter(itemParameters => itemParameters.name != "id" && itemParameters.name != "identifier").length > 0 ?
                                        //      "" :
                                        //      "[]"), 0, 0);

                                        this.writeQueryParameters(parametersArray,objOperation);

                                        let responsesObject={};
                                        wOperationObject.responses=responsesObject;

                                        let ok200Object={}
                                        responsesObject['200']=ok200Object;

                                        ok200Object.description='OK';

                                        let contentObject={};
                                        ok200Object.content=contentObject;

                                        let appJsonObject={};
                                        contentObject['application/json']=appJsonObject;

                                        let schemaObject={};
                                        appJsonObject.schema=schemaObject;

                                        let itemsObject={};
                                        schemaObject.items=itemsObject;
                                        itemsObject['$ref']='#/components/schemas/' + objInterface.source.name;

                                        schemaObject.type='array';


                                   } else if (objOperation.name.toUpperCase() == "POST") {
                                        console.log("---WO-2-post","/" + objInterface.target.name);
                                        pathsObject.post=wOperationObject;


                                        let tagsArray=[];

                                        wOperationObject.tags=tagsArray;

                                        tagsArray.push(objInterface.target.name);


                                        wOperationObject.description='Create a new ' + objInterface.source.name;

                                        let requestBodyObj={}
                                        wOperationObject.requestBody=requestBodyObj;
                                        this.buildRequestBody(objInterface,requestBodyObj);

                                        
                                        let responsesObject={};
                                        wOperationObject.responses=responsesObject;

                                        let created201Object={};
                                        responsesObject['201']=created201Object;

                                        let contentObj={};
                                        created201Object.content=contentObj;

                                        let appJsonObj={};
                                        contentObj['application/json']=appJsonObj;

                                        let schemaObj={};
                                        appJsonObj.schema=schemaObj;
                                        schemaObj['$ref']='#/components/schemas/' + objInterface.source.name;


                                        created201Object.description='Created';

                                   }
                              });



                              let checkOperationArr = objInterface.target.operations.filter(item => {
                                   return item.name == "GET" || item.name == "PUT" || item.name == "DELTE";
                              });

                              if (checkOperationArr.length > 0) {
                                   let pathsObject={};
                                   let operationAttributes = objInterface.target.attributes.filter(item => {
                                        return item.name == "id" || item.name == "identifier";
                                   });
                                   operationAttributes.forEach(operationAttribute => {
                                        mainPathsObject["/" + objInterface.target.name+'/{' + operationAttribute.name + '}']=pathsObject


                                        objInterface.target.operations.forEach(objOperation => {
                                             let wOperationObject={};
                                             if (objOperation.name.toUpperCase() == "GET") {
                                                  console.log("---WO-3-get","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.get=wOperationObject;


                                                  let tagsArray=[];
                                                  wOperationObject.tags=tagsArray;

                                                  tagsArray.push(objInterface.target.name);


                                                  wOperationObject.description='Get single ' + objInterface.source.name + ' by ' + operationAttribute.name;

                                                  let parametersArray=[];
                                                  wOperationObject.parameters=parametersArray;
                                                  let paramsObject={};
                                                  parametersArray.push(paramsObject);

                                                  let objSchema={};
                                                  objSchema.type='string';

                                                  this.utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? this.utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema,paramsObject);

                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            let paramsObject={};
                                                            this.utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? this.utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema,paramsObject);
                                                            parametersArray.push(paramsObject);
                                                       }
                                                  })

                                                  let responsesObj={};
                                                  wOperationObject.responses=responsesObj;

                                                  let ok200ResOjb={};
                                                  responsesObj['200']=ok200ResOjb;

                                                  ok200ResOjb.description='OK';

                                                  let contentObj={};
                                                  ok200ResOjb.content=contentObj;


                                                  let appJsonObj={};
                                                  contentObj['application/json']=appJsonObj;

                                                  let schemaObj={};
                                                  appJsonObj.schema=schemaObj;
                                                  schemaObj['$ref']='#/components/schemas/' + objInterface.source.name;




                                             } else if (objOperation.name.toUpperCase() == "DELETE") {
                                                  console.log("---WO-4-delete","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.delete=wOperationObject;

                                                  let tagsArray=[];
                                                  wOperationObject.tags=tagsArray;

                                                  tagsArray.push(objInterface.target.name);


                                                  wOperationObject.description='Delete an existing ' + objInterface.source.name;

                                                  let parametersArray=[];
                                                  wOperationObject.parameters=parametersArray;
                                                  let paramsObject={};
                                                  parametersArray.push(paramsObject);

                                                  let objSchema={};
                                                  objSchema.type='string';

                                                  this.utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? this.utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema,paramsObject);

                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       let paramsObject={};
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? this.utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema,paramsObject);
                                                            parametersArray.push(paramsObject);
                                                       }
                                                  });

                                                  let resObj={};
                                                  wOperationObject.responses=resObj;

                                                  let noContent204Obj={};
                                                  resObj['204']=noContent204Obj;
                                                  noContent204Obj.description='No Content';




                                             } else if (objOperation.name.toUpperCase() == "PUT") {
                                                  console.log("---WO-5-put","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.put=wOperationObject;

                                                  let tagsArray=[];
                                                  wOperationObject.tags=tagsArray;

                                                  tagsArray.push(objInterface.target.name);


                                                  wOperationObject.description='Update an existing ' + objInterface.source.name;

                                                  let parametersArray=[];
                                                  wOperationObject.parameters=parametersArray;
                                                  let paramsObject={};
                                                  parametersArray.push(paramsObject);

                                                  let objSchema={};
                                                  objSchema.type='string';

                                                  this.utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? this.utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema,paramsObject);
                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       let paramsObject={};
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? this.utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema,paramsObject);
                                                            parametersArray.push(paramsObject);
                                                       }
                                                  });

                                                  let requestBodyObj={}
                                                  wOperationObject.requestBody=requestBodyObj;

                                                  this.buildRequestBody(objInterface,requestBodyObj);
                                                  
                                                  let resObj={};
                                                  wOperationObject.responses=resObj;

                                                  let ok200Obj={};
                                                  resObj['200']=ok200Obj;

                                                  ok200Obj.description='OK';

                                                  let contentObj={};
                                                  ok200Obj.content=contentObj;

                                                  let appJsonObj={};
                                                  contentObj['application/json']=appJsonObj;

                                                  let schemaObj={};
                                                  appJsonObj.schema=schemaObj;
                                                  schemaObj['$ref']='#/components/schemas/' + objInterface.source.name;



                                             } else if (objOperation.name.toUpperCase() == "PATCH") {
                                                  console.log("---WO-6-patch","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.patch=wOperationObject;

                                                  let tagsArray=[];
                                                  wOperationObject.tags=tagsArray;

                                                  tagsArray.push(objInterface.target.name);


                                                  wOperationObject.description='Update ' + objInterface.source.name;

                                                  let parametersArray=[];
                                                  wOperationObject.parameters=parametersArray;
                                                  let paramsObject={};
                                                  parametersArray.push(paramsObject);

                                                  let objSchema={};
                                                  objSchema.type='string';

                                                  this.utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? this.utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema,paramsObject);
                                                  objInterface.target.attributes.forEach(itemAttribute => {
                                                       let paramsObject={};
                                                       if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                                                            this.utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? this.utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema,paramsObject);
                                                            parametersArray.push(paramsObject);
                                                       }
                                                  });

                                                  let requestBodyObj={}
                                                  wOperationObject.requestBody=requestBodyObj;
                                                  this.buildRequestBody( objInterface,requestBodyObj);

                                                  let resObj={};
                                                  wOperationObject.responses=resObj;


                                                  let noContentObj={};
                                                  resObj['204']=noContentObj;
                                                  noContentObj.description='No Content';


                                             }
                                        });

                                   });
                              }

                         } else {
                              if (objInterface.target.ownedElements.length > 0) {
                                   let interfaceRelation = objInterface.target.ownedElements;
                                   interfaceRelation.forEach(interAsso => {
                                        if (interAsso instanceof type.UMLAssociation) {
                                             if (interAsso.end2.aggregation == "composite") {
                                                  this.writeInterfaceComposite(objInterface, interAsso,mainPathsObject);
                                             }
                                        }
                                   });
                              }
                         }

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }

          return mainPathsObject;
     }


     

     /**
      *
      *
      * @param {UMLInterfaceRealization} objInterface
      * @param {Object} requestBodyObj
      * @memberof Operations
      */
     buildRequestBody(objInterface,requestBodyObj) {

          let contentObj={};
          requestBodyObj.content=contentObj;

          let appJsonObject={};
          contentObj['application/json']=appJsonObject;

          let schemaObj={};
          appJsonObject.schema=schemaObj;

          schemaObj['$ref']='#/components/schemas/' + objInterface.source.name;


          requestBodyObj.description='';
          requestBodyObj.required=true;

     }

     /**
      * @function writeInterfaceComposite
      * @description Adds interface composision
      * @param {UMLInterfaceRealization} interfaceRealization 
      * @param {UMLAssociation} interfaceAssociation 
      * @param {Object} mainPathsObject
      */
     
     writeInterfaceComposite(interfaceRealization, interfaceAssociation,mainPathsObject) {
          try {
               
               let end1Interface = interfaceAssociation.end1;
               let end2Interface = interfaceAssociation.end2;
               let pathsObject={};
               interfaceRealization.target.operations.forEach(objOperation => {
                    
                    let wOperationObject={};
                    if (objOperation.name.toUpperCase() == "GET") {
                         let mICPath="/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;
                         console.log('---WIC-1-get',mICPath);

                         mainPathsObject[mICPath]=pathsObject;
                         /* Get all list */

                         pathsObject.get=wOperationObject;

                         let tagsArray=[];
                         wOperationObject.tags=tagsArray;

                         tagsArray.push(interfaceRealization.target.name);


                         wOperationObject.description='Get a list of ' +interfaceRealization.source.name;

                         let parametersArray=[];
                         wOperationObject.parameters=parametersArray;
                         let paramsObject={};
                         parametersArray.push(paramsObject);

                         let objSchema={};
                         objSchema.type='string';

                         this.utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema,paramsObject);

                         let responsesObj={};
                         wOperationObject.responses=responsesObj;

                         let ok200ResOjb={};
                         responsesObj['200']=ok200ResOjb;

                         ok200ResOjb.description='OK';

                         let contentObj={};
                         ok200ResOjb.content=contentObj;

                         let appJsonObj={};
                         contentObj['application/json']=appJsonObj;

                         let schemaObj={};
                         appJsonObj.schema=schemaObj;
                         

                         let itemsArray=[];
                         schemaObj.items=itemsArray;
                         let itemsObj={};
                         itemsArray.push(itemsObj);
                         itemsObj['$ref']='#/components/schemas/' + interfaceRealization.source.name;
                         schemaObj.type='array';



                         /* Get single element record */

                         let mICPath1="/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";

                         console.log('---WIC-2-get',mICPath1);
                         let pathsSingleObject={};
                         mainPathsObject[mICPath1]=pathsSingleObject;

                         let wOperationSingleObject={};
                         pathsSingleObject.get=wOperationSingleObject;

                         let tagsSingleArray=[];
                         wOperationSingleObject.tags=tagsSingleArray;

                         tagsSingleArray.push(interfaceRealization.target.name);


                         wOperationSingleObject.description='Get a list of ' +interfaceRealization.source.name;

                         let parametersSingleArray=[];
                         wOperationSingleObject.parameters=parametersSingleArray;
                         let paramsSingleObject={};
                         parametersSingleArray.push(paramsSingleObject);

                         let objSingleSchema={};
                         objSingleSchema.type='string';

                         this.utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")
                         this.utils.buildParameter(end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true,objSingleSchema,paramsSingleObject)

                         wOperationSingleObject.responses=responsesSingleObj;

                         responsesSingleObj['200']=ok200SingleResOjb;

                         ok200SingleResOjb.description='OK';

                         let contentSingleObj={};
                         ok200SingleResOjb.content=contentSingleObj;

                         let appJsonSingleObj={};
                         contentSingleObj['application/json']=appJsonSingleObj;

                         let schemaSingleObj={};
                         appJsonSingleObj.schema=schemaSingleObj;

                         schemaSingleObj['$ref']='#/components/schemas/' + interfaceRealization.source.name;




                    } else if (objOperation.name.toUpperCase() == "POST") {

                         let mICPath="/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;
                         console.log('---WIC-2-post',mICPath);

                         mainPathsObject[mICPath]=pathsObject;



                         pathsObject.post=wOperationObject;

                         let tagsArray=[];

                         wOperationObject.tags=tagsArray;

                         tagsArray.push(interfaceRealization.target.name);

                         wOperationObject.description='Create a new ' + interfaceRealization.source.name;

                         let parametersArray=[];
                         wOperationObject.parameters=parametersArray;
                         let paramsObject={};
                         parametersArray.push(paramsObject);

                         let objSchema={};
                         objSchema.type='string';

                         this.utils.buildParameter(end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema,paramsObject);

                         let requestBodyObj={}
                         wOperationObject.requestBody=requestBodyObj;

                         this.buildRequestBody(interfaceRealization,requestBodyObj);

                         let resObj={};
                         wOperationObject.responses=resObj;

                         let ok201Obj={};
                         resObj['201']=ok201Obj;

                         let contentObj={};
                         ok201Obj.content=contentObj;

                         let appJsonObj={};
                         contentObj['application/json']=appJsonObj;

                         let schemaObj={};
                         appJsonObj.schema=schemaObj;
                         schemaObj['$ref']='#/components/schemas/' + interfaceRealization.source.name;


                         ok201Obj.description='Created';




                    } else if (objOperation.name.toUpperCase() == "DELETE") {

                         let mICPath="/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";
                         console.log('---WIC-3-delete',mICPath);

                         mainPathsObject[mICPath]=pathsObject;

                         console.log('---WIC-3-delete',);


                         pathsObject.delete=wOperationObject;

                         let tagsArray=[];
                         wOperationObject.tags=tagsArray;

                         //AskQue
                         // codeWriter.writeLine("- " + objInterface.target.name, 1, 1);
                         // codeWriter.writeLine("- " + interfaceRealization.target.name, 1, 1);
                         tagsArray.push(interfaceRealization.target.name);
                         


                         //AskQue
                         // codeWriter.writeLine("description: Delete an existing " + objInterface.source.name, 0, 0);
                         // codeWriter.writeLine("description: Delete an existing " + interfaceRealization.source.name, 0, 0);
                         wOperationObject.description='Delete an existing ' + interfaceRealization.source.name;


                         let parametersArray=[];
                         wOperationObject.parameters=parametersArray;
                         let paramsObject={};
                         parametersArray.push(paramsObject);

                         let objSchema={};
                         objSchema.type='string';

                         this.utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema,paramsObject);

                         //AskQue
                         let paramsObject1={};
                         this.utils.buildParameter(end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema,paramsObject1);
                         parametersArray.push(paramsObject1);
                         let resObj={};
                         wOperationObject.responses=resObj;

                         let noContent204Obj={};
                         resObj['204']=noContent204Obj;
                         noContent204Obj.description='No Content';

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }

     
     /**
      *
      *
      * @param {Array} parametersArray
      * @param {Object} objOperation
      * @memberof Operations
      */
     writeQueryParameters(parametersArray, objOperation) {
          try {
               objOperation.parameters.forEach(itemParameters => {
                    let paramsObject = {};
                    if (itemParameters.name != "id" && itemParameters.name != "identifier") {
                         parametersArray.push(paramsObject);
                         let objSchema = {};
                         objSchema.type = 'string';
                         if (!(itemParameters.type instanceof type.UMLClass)) {
                              this.utils.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
                                   this.utils.buildDescription(itemParameters.documentation) :
                                   "missing description"), false, objSchema,paramsObject);
                         } else {

                              this.utils.buildParameter(itemParameters.type.name + "." + itemParameters.name, "query", (itemParameters.documentation ?
                                   this.utils.buildDescription(itemParameters.documentation) :
                                   "missing description"), false, objSchema,paramsObject);


                         }
                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
     // writeQueryParameters(parametersArray, objOperation) {
     //      ////Here to start
     //      try {
     //           objOperation.parameters.forEach(itemParameters => {
     //                let paramsObject={};
                    
     //                if (itemParameters.name != "id" && itemParameters.name != "identifier") {
     //                     parametersArray.push(paramsObject);
     //                     let objSchema={};
     //                     objSchema.type='string';
     //                     if (!(itemParameters.type instanceof type.UMLClass)) {
     //                          //  name, type, description, required, schema
                              
     //                          this.utils.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
     //                               this.utils.buildDescription(itemParameters.documentation) :
     //                               "missing description"), false, objSchema,paramsObject);

     //                               //AskQue
     //                               // this.utils.buildParameter(itemParameters.name, "query", (itemParameters.documentation ?
     //                               //      this.utils.buildDescription(itemParameters.documentation) :
     //                               //      "missing description"), false, "{type: string}");
     //                     } else {

     //                          let param = itemParameters.type.attributes.filter(item => {
     //                               return itemParameters.name.toUpperCase() == item.name.toUpperCase();
     //                          });

     //                          if (param.length == 0) {
     //                               let generalizeClasses = this.generalization.findGeneralizationOfClass(itemParameters.type,getFilePath());
     //                               console.log(generalizeClasses);
     //                               param = generalizeClasses[0].target.attributes.filter(item => {
     //                                    return itemParameters.name.toUpperCase() == item.name.toUpperCase();
     //                               });
     //                          }

     //                          if (param[0].type == "DateTime") {
     //                               this.utils.buildParameter("before_" + param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);
     //                               this.utils.buildParameter("after_" + param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);

     //                          } else {
     //                               this.utils.buildParameter(param[0].name, "query", (itemParameters.documentation ?
     //                                    this.utils.buildDescription(itemParameters.documentation) :
     //                                    "missing description"), false, objSchema,paramsObject);
     //                          }

     //                     }
     //                }
     //           });
     //      } catch (error) {
     //           console.error("Found error", error.message);
     //           this.utils.writeErrorToFile(error,getFilePath());
     //      }
     // }
     
}

module.exports = Paths;