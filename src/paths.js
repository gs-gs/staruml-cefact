const Utils = require('./utils');
const openAPI = require('./openapi');
// const Generalization = require('./generalization');
const constant = require('./constant');
const Operations = require('./operations');
var diagramEle = require('./diagram/diagramElement');
/**
 * @class Paths
 * @description class returns the Paths
 */
class Paths {
     /**
      * @constructor Creates an instance of Paths.
      */
     constructor() {
          this.utils = new Utils();
          // this.generalization = new Generalization();
          this.operations = new Operations();
     }

     /**
      * @function getOperations
      * @description Return Operations object 
      * @return {object} mainPathsObject
      * @memberof Paths
      */
     getOperations() {
          let mainPathsObject = {};

          try {
               let paths, interfaceRealalization;
               if (openAPI.getModelType() == openAPI.APP_MODEL_PACKAGE) {
                    interfaceRealalization = app.repository.select("@UMLInterfaceRealization");
                    paths = openAPI.getPaths();
               } else if (openAPI.getModelType() == openAPI.APP_MODEL_DIAGRAM) {
                    interfaceRealalization = diagramEle.getUMLInterfaceRealization();
                    paths = diagramEle.getUMLInterface();
               }

               paths.forEach(objOperation => {

                    let filteredInterfaceRealization = interfaceRealalization.filter(itemInterface => {
                         return itemInterface.target.name == objOperation.name;
                    });

                    if (filteredInterfaceRealization.length > 0) {


                         let objInterRealization = filteredInterfaceRealization[0];

                         let interfaceAssociation = app.repository.select(objInterRealization.target.name + "::@UMLAssociation");
                         let filterInterfaceAssociation = interfaceAssociation.filter(item => {
                              return item.end2.aggregation == "composite";
                         });

                         if (filterInterfaceAssociation.length == 0) {
                              let pathsObject = {};
                              mainPathsObject["/" + objInterRealization.target.name] = pathsObject;


                              objInterRealization.target.operations.forEach(objOperation => {

                                   if (objOperation.name.toUpperCase() == "GET") {
                                        pathsObject.get = this.operations.get(objInterRealization, objOperation);


                                   } else if (objOperation.name.toUpperCase() == "POST") {
                                        pathsObject.post = this.operations.post(objInterRealization, null);

                                   }
                              });



                              let checkOperationArr = objInterRealization.target.operations.filter(item => {
                                   return item.name == "GET" || item.name == "PUT" || item.name == "DELTE";
                              });

                              if (checkOperationArr.length > 0) {
                                   let pathsObject = {};
                                   let operationAttributes = objInterRealization.target.attributes.filter(item => {
                                        return item.name == "id" || item.name == "identifier";
                                   });
                                   operationAttributes.forEach(operationAttribute => {
                                        mainPathsObject["/" + objInterRealization.target.name + '/{' + operationAttribute.name + '}'] = pathsObject


                                        objInterRealization.target.operations.forEach(objOperation => {
                                             let wOperationObject = {};
                                             if (objOperation.name.toUpperCase() == "GET") {
                                                  pathsObject.get = wOperationObject;
                                                  pathsObject.get = this.operations.getOperationAttribute(objInterRealization, operationAttribute)


                                             } else if (objOperation.name.toUpperCase() == "DELETE") {
                                                  pathsObject.delete = this.operations.delete(objInterRealization, operationAttribute, null, null);




                                             } else if (objOperation.name.toUpperCase() == "PUT") {
                                                  pathsObject.put = this.operations.put(objInterRealization, operationAttribute);



                                             } else if (objOperation.name.toUpperCase() == "PATCH") {
                                                  pathsObject.patch = this.operations.patch(objInterRealization, operationAttribute);


                                             }
                                        });

                                   });
                              }

                         } else {
                              if (objInterRealization.target.ownedElements.length > 0) {
                                   let interfaceRelation = objInterRealization.target.ownedElements;
                                   interfaceRelation.forEach(interAsso => {
                                        if (interAsso instanceof type.UMLAssociation) {
                                             if (interAsso.end2.aggregation == "composite") {
                                                  this.writeInterfaceComposite(objInterRealization, interAsso, mainPathsObject);
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
      * @memberof Paths 
      */

     writeInterfaceComposite(interfaceRealization, interfaceAssociation, mainPathsObject) {
          try {

               let end1Interface = interfaceAssociation.end1;
               let end2Interface = interfaceAssociation.end2;
               let pathsObject = {};
               interfaceRealization.target.operations.forEach(objOperation => {

                    let wOperationObject = {};
                    if (objOperation.name.toUpperCase() == "GET") {
                         let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;

                         mainPathsObject[mICPath] = pathsObject;
                         /* Get all list */

                         pathsObject.get = wOperationObject;

                         let tagsArray = [];
                         wOperationObject.tags = tagsArray;

                         tagsArray.push(interfaceRealization.target.name);


                         wOperationObject.description = 'Get a list of ' + interfaceRealization.source.name;

                         let parametersArray = [];
                         wOperationObject.parameters = parametersArray;
                         let paramsObject = {};
                         parametersArray.push(paramsObject);

                         let objSchema = {};
                         objSchema.type = 'string';

                         this.utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema, paramsObject);

                         let responsesObj = {};
                         wOperationObject.responses = responsesObj;

                         let ok200ResOjb = {};
                         responsesObj['200'] = ok200ResOjb;

                         ok200ResOjb.description = 'OK';

                         let contentObj = {};
                         ok200ResOjb.content = contentObj;

                         let appJsonObj = {};
                         contentObj['application/json'] = appJsonObj;

                         let schemaObj = {};
                         appJsonObj.schema = schemaObj;


                         let itemsArray = [];
                         schemaObj.items = itemsArray;
                         let itemsObj = {};
                         itemsArray.push(itemsObj);
                         itemsObj['$ref'] = constant.getReference() + interfaceRealization.source.name;
                         schemaObj.type = 'array';



                         /* Get single element record */

                         let mICPath1 = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";

                         let pathsSingleObject = {};
                         mainPathsObject[mICPath1] = pathsSingleObject;

                         let wOperationSingleObject = {};
                         pathsSingleObject.get = wOperationSingleObject;

                         let tagsSingleArray = [];
                         wOperationSingleObject.tags = tagsSingleArray;

                         tagsSingleArray.push(interfaceRealization.target.name);


                         wOperationSingleObject.description = 'Get a list of ' + interfaceRealization.source.name;

                         let parametersSingleArray = [];
                         wOperationSingleObject.parameters = parametersSingleArray;
                         let paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         let objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         this.utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")
                         this.utils.buildParameter(end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? this.utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, objSingleSchema, paramsSingleObject)

                         wOperationSingleObject.responses = responsesSingleObj;

                         responsesSingleObj['200'] = ok200SingleResOjb;

                         ok200SingleResOjb.description = 'OK';

                         let contentSingleObj = {};
                         ok200SingleResOjb.content = contentSingleObj;

                         let appJsonSingleObj = {};
                         contentSingleObj['application/json'] = appJsonSingleObj;

                         let schemaSingleObj = {};
                         appJsonSingleObj.schema = schemaSingleObj;

                         schemaSingleObj['$ref'] = constant.getReference() + interfaceRealization.source.name;




                    } else if (objOperation.name.toUpperCase() == "POST") {

                         let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;

                         mainPathsObject[mICPath] = pathsObject;

                         pathsObject.post = this.operations.post(interfaceRealization, end2Interface);


                    } else if (objOperation.name.toUpperCase() == "DELETE") {

                         let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";

                         mainPathsObject[mICPath] = pathsObject;

                         pathsObject.delete = this.operations.delete(interfaceRealization, null, end1Interface, end2Interface);

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               this.utils.writeErrorToFile(error);
          }
     }
}

module.exports = Paths;