const forEach = require('async-foreach').forEach;
const utils = require('./utils');
const openAPI = require('./openapi');
// const Generalization = require('./generalization');
const constant = require('./constant');
const Operations = require('./operations');
const dElement = require('./diagram/dElement');
/**
 * @class Paths
 * @description class returns the Paths
 */
class Paths {
     /**
      * @constructor Creates an instance of Paths.
      */
     constructor() {
          utils.resetErrorBlock();
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
               paths = openAPI.getPaths();
               if (openAPI.isModelPackage()) {
                    interfaceRealalization = app.repository.select("@UMLInterfaceRealization");
               } else if (openAPI.isModelDiagram()) {
                    interfaceRealalization = [];
                    let interfaceRealalizationView = dElement.getUMLInterfaceRealizationView();
                    forEach(interfaceRealalizationView, function (mView) {
                         interfaceRealalization.push(mView.model);
                    });
               }

               paths.forEach(objInterface => {

                    let mInterfaceView = utils.getViewFromCurrentDiagram(objInterface);
                    // It  will return, The interface that will be the target interface of the interface realization
                    let filteredInterfaceRealization = interfaceRealalization.filter(itemInterfaceRealization => {
                         return itemInterfaceRealization.target.name == objInterface.name;
                    });

                    if (filteredInterfaceRealization.length > 0) {


                         let objInterfaceRealization = filteredInterfaceRealization[0];


                         let interfaceAssociation = app.repository.select(objInterface.name + "::@UMLAssociation");
                         let filterInterfaceAssociation = interfaceAssociation.filter(item => {
                              return item.end2.aggregation == "composite";
                         });

                         if (filterInterfaceAssociation.length == 0) {
                              let pathsObject = {};
                              mainPathsObject["/" + objInterface.name] = pathsObject;
                              let mOperations = [];
                              if (openAPI.isModelPackage()) {
                                   mOperations = objInterface.operations;
                              } else if (openAPI.isModelDiagram()) {
                                   if (mInterfaceView != null) {
                                        let operationViews = utils.getVisibleOperationView(mInterfaceView)
                                        forEach(operationViews, function (operationView) {
                                             mOperations.push(operationView.model);
                                        });
                                   }

                              }
                              mOperations.forEach(objOperation => {

                                   /* Filter for visible operation Views from diagram elements (Interface) */
                                   if (objOperation.name.toUpperCase() == "GET") {
                                        pathsObject.get = this.operations.get(objInterfaceRealization, objOperation);


                                   } else if (objOperation.name.toUpperCase() == "POST") {
                                        pathsObject.post = this.operations.post(objInterfaceRealization, null);

                                   }

                              });



                              let checkOperationArr = mOperations.filter(item => {
                                   return item.name == "GET" || item.name == "PUT" || item.name == "DELTE";
                              });

                              if (checkOperationArr.length > 0) {
                                   let pathsObject = {};


                                   let mAttributes = [];
                                   if (openAPI.isModelPackage()) {
                                        mAttributes = objInterface.attributes;
                                   } else if (openAPI.isModelDiagram()) {
                                        if (mInterfaceView != null) {
                                             let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                                             forEach(attributeViews, function (attributeView) {
                                                  mAttributes.push(attributeView.model);
                                             });
                                        }

                                   }



                                   let interfaceAttributes = /* objInterface.attributes */ mAttributes.filter(item => {
                                        return item.name == "id" || item.name == "identifier";
                                   });
                                   interfaceAttributes.forEach(iAttribute => {


                                        /* Filter for visible attribute Views from diagram elements (Class & Interface) */

                                        mainPathsObject["/" + objInterface.name + '/{' + iAttribute.name + '}'] = pathsObject


                                        mOperations.forEach(objOperation => {


                                             /* Filter for visible operation Views from diagram elements (Interface) */

                                             let wOperationObject = {};
                                             if (objOperation.name.toUpperCase() == "GET") {
                                                  pathsObject.get = wOperationObject;
                                                  pathsObject.get = this.operations.getOperationAttribute(objInterfaceRealization, iAttribute)


                                             } else if (objOperation.name.toUpperCase() == "DELETE") {
                                                  pathsObject.delete = this.operations.delete(objInterfaceRealization, iAttribute, null, null);




                                             } else if (objOperation.name.toUpperCase() == "PUT") {
                                                  pathsObject.put = this.operations.put(objInterfaceRealization, iAttribute);



                                             } else if (objOperation.name.toUpperCase() == "PATCH") {
                                                  pathsObject.patch = this.operations.patch(objInterfaceRealization, iAttribute);


                                             }
                                        });

                                   });
                              }

                         } else {
                              if (objInterface.ownedElements.length > 0) {
                                   let interfaceRelation = objInterface.ownedElements;
                                   interfaceRelation.forEach(interAsso => {
                                        if (interAsso instanceof type.UMLAssociation) {
                                             if (interAsso.end2.aggregation == "composite") {
                                                  this.writeInterfaceComposite(objInterfaceRealization, interAsso, mainPathsObject);
                                             }
                                        }
                                   });
                              }
                         }

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
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

                    /* Filter for visible operation Views from diagram elements (Interface) */


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

                         utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema, paramsObject);

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

                         utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, "{type: string}")
                         utils.buildParameter(end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, objSingleSchema, paramsSingleObject)

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
               utils.writeErrorToFile(error);
          }
     }
}

module.exports = Paths;