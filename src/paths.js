const Utils=require('./utils');
const openAPI=require('./openapi');
const Generalization =require('./generalization');
const constant =require('./constant');
const Operations =require('./operations');
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
          this.operations=new Operations();
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
                                        pathsObject.get=this.operations.get(objInterface,objOperation);


                                   } else if (objOperation.name.toUpperCase() == "POST") {
                                        console.log("---WO-2-post","/" + objInterface.target.name);
                                        pathsObject.post=this.operations.post(objInterface,null);

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
                                                  ///---
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
                                                  ///---
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
                                                  schemaObj['$ref']=constant.getReference() + objInterface.source.name;




                                             } else if (objOperation.name.toUpperCase() == "DELETE") {
                                                  console.log("---WO-4-delete","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.delete=this.operations.delete(objInterface,operationAttribute,null,null);




                                             } else if (objOperation.name.toUpperCase() == "PUT") {
                                                  console.log("---WO-5-put","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.put=this.operations.put(objInterface,operationAttribute);



                                             } else if (objOperation.name.toUpperCase() == "PATCH") {
                                                  console.log("---WO-6-patch","/" + objInterface.target.name+'/{' + operationAttribute.name + '}');
                                                  pathsObject.patch=this.operations.patch(objInterface,operationAttribute);


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
                         itemsObj['$ref']=constant.getReference() + interfaceRealization.source.name;
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

                         schemaSingleObj['$ref']=constant.getReference() + interfaceRealization.source.name;




                    } else if (objOperation.name.toUpperCase() == "POST") {

                         let mICPath="/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;
                         console.log('---WIC-2-post',mICPath);

                         mainPathsObject[mICPath]=pathsObject;

                         pathsObject.post=this.operations.post(interfaceRealization,end2Interface);


                    } else if (objOperation.name.toUpperCase() == "DELETE") {

                         let mICPath="/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";
                         console.log('---WIC-3-delete',mICPath);

                         mainPathsObject[mICPath]=pathsObject;

                         console.log('---WIC-3-delete',);


                         pathsObject.delete=this.operations.delete(interfaceRealization,null,end1Interface,end2Interface);

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }

     
     
     
     
}

module.exports = Paths;