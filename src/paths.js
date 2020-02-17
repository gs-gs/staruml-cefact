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
      * @function getSubResources
      * @param {Array} paths
      * @description returns array of UMLInterface those are sub-resources of any other UMLInterface
      * @returns {Array} 
      * @memberof Paths
      */
     getSubResources(paths) {
          let tmpResources = [];
          paths.forEach(objInterface => {
               let interfaceAssociation = utils.fetchUMLAssociation();

               let resFilter = interfaceAssociation.filter(function (item) {
                    return (item.end1.aggregation == 'composite' && item.end1.reference._id == objInterface._id);
               });


               let filterInterfaceAssociation = resFilter.filter(function (item) {
                    return item.end2.aggregation == 'none';
               });

               forEach(filterInterfaceAssociation, function (assoc) {
                    tmpResources.push(assoc.end2.reference);
               });
          });
          let subResource = [];
          tmpResources.filter(function (item) {
               let result = subResource.filter(function (sRes) {
                    return sRes._id == item._id;
               });
               if (result.length == 0) {
                    subResource.push(item);
               }
          });
          console.log("subResource", subResource);
          return subResource;
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
               interfaceRealalization=utils.fetchUMLInterfaceRealization();

               /* Get list of sub-resource  */
               let subResources = this.getSubResources(paths);

               /* Skipping interface which is sub-resource for other interface */
               let pathWithoutSubresource = [];
               forEach(paths, function (path) {
                    let res = subResources.filter(function (sRes) {
                         return path._id == sRes._id;
                    });
                    if (res.length == 0) {
                         pathWithoutSubresource.push(path);
                    }
               });

               /* Iterate to all path and generate request method (POST,GET,PUT,DELETE) */
               pathWithoutSubresource.forEach(objInterface => {

                    /* view of Interface */
                    let mInterfaceView = utils.getViewFromCurrentDiagram(objInterface);

                    /*  It  will return, The interface that will be the target interface of the interface realization */
                    let filteredInterfaceRealization = interfaceRealalization.filter(itemInterfaceRealization => {
                         return itemInterfaceRealization.target.name == objInterface.name;
                    });

                    if (filteredInterfaceRealization.length > 0) {


                         let objInterfaceRealization = filteredInterfaceRealization[0];

                         /* Get visible operations based on selection ('package' or 'diagram')  */
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

                         /* 1.
                         write simple path object of GET, POST operations 
                         Pattern : (GET/POST) : '/{pathname}'
                         */
                         this.writeSimplePathObject(pathsObject, mOperations, mainPathsObject, objInterfaceRealization);

                         /* 2.
                         write {id} path object of (GET, PUT, DELETE) Operations
                         Pattern : (GET/PUT/DELETE) : '/{pathname}/{id}'
                         */
                         this.writeIDPathObject(mInterfaceView, objInterface, mOperations, mainPathsObject, objInterfaceRealization);

                         /* 3.
                         Write path object for sub-resource pattern #90 
                         Pattern : (GET/POST/DELETE/PUT) : '/{pathname}/{id}/{sub-resource-pathname}/{sub-resource-id}'
                         */
                         this.writeSubResourcePathObject(objInterface, objInterfaceRealization, mainPathsObject);

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }

          return mainPathsObject;
     }

     /**
      * @function writeSubResourcePathObject
      * @description write path object of sub resource interface
      * @param {Object} objInterface
      * @memberof Paths
      */
     writeSubResourcePathObject(objInterface, objInterfaceRealization, mainPathsObject) {
          if (this.hasSubResources(objInterface)) {
               if (objInterface.ownedElements.length > 0) {
                    let interfaceRelation = objInterface.ownedElements;
                    interfaceRelation.forEach(interAsso => {
                         if (interAsso instanceof type.UMLAssociation) {
                              if (interAsso.end1.aggregation == "composite" && interAsso.end2.aggregation == "none") {
                                   this.writeInterfaceComposite(objInterfaceRealization, interAsso, mainPathsObject);
                              }
                         }
                    });
               }
          }
     }
     /**
      * @function writeSimplePathObject
      * @description write simple path object of interface
      * @param {Object} pathsObject
      * @param {Array} mOperations
      * @param {Object} mainPathsObject
      * @param {UMLInterfaceRealization} objInterfaceRealization
      * @return {object} mainPathsObject
      * @memberof Paths
      */
     writeSimplePathObject(pathsObject, mOperations, mainPathsObject, objInterfaceRealization) {
          mOperations.forEach(objOperation => {

               if (objOperation.name.toUpperCase() == "GET") {
                    pathsObject.get = this.operations.get(mainPathsObject, objInterfaceRealization, objOperation);


               } else if (objOperation.name.toUpperCase() == "POST") {
                    pathsObject.post = this.operations.post(objInterfaceRealization, null);

               }

          });
     }

     /**
      * @function writeIDPathObject
      * @description write path object with {id} parameter in path of interface
      * @param {UMLInterfaceView} mInterfaceView
      * @param {UMLInterface} objInterface
      * @param {Array} mOperations
      * @param {Object} mainPathsObject
      * @param {UMLInterfaceRealization} objInterfaceRealization
      * @memberof Paths
      */
     writeIDPathObject(mInterfaceView, objInterface, mOperations, mainPathsObject, objInterfaceRealization) {
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

               let interfaceAttributes = mAttributes.filter(item => {
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
     }

     /**
      * @function hasSubResources
      * @param {UMLInterface} objInterface
      * @description check that interface has any sub resources and return boolean
      * @returns {boolean}
      * @memberof Paths
      */
     hasSubResources(objInterface) {
          let interfaceAssociation = utils.fetchUMLAssociation();

          let resFilter = interfaceAssociation.filter(function (item) {
               return (item.end1.aggregation == 'composite' && item.end1.reference._id == objInterface._id);
          });


          let filterInterfaceAssociation = resFilter.filter(function (item) {
               return item.end2.aggregation == 'none';
          });

          /* sub-resource pattern #90 */
          if (filterInterfaceAssociation.length > 0) {
               return true;
          }
          return false;
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


               let end1Interface = interfaceAssociation.end1; //source example : imprtDeclarations
               let end2Interface = interfaceAssociation.end2; //target : CargoLines
               interfaceRealization.target.operations.forEach(objOperation => {
                    console.log("interfaceRealization", objOperation);
                    /* Filter for visible operation Views from diagram elements (Interface) */


                    let pathsObject = {};
                    let wOperationObject = {};
                    if (objOperation.name.toUpperCase() == "GET") {
                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name;
                         // let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;
                         //test
                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }
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

                         let name = end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name;
                         let description = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description");
                         /* let name = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name;
                         let description = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"); */
                         utils.buildParameter(name, "path", description, true, objSchema, paramsObject);

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


                         let itemsObject = {};
                         schemaObj.items = itemsObject;
                         itemsObject['$ref'] = constant.getReference() + interfaceRealization.source.name;
                         schemaObj.type = 'object';



                         /* Get single element record */

                         let mICPath1 = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}";
                         //   let mICPath1 = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";

                         let pathsSingleObject = {};
                         if (mainPathsObject.hasOwnProperty(mICPath1)) {
                              pathsSingleObject = mainPathsObject[mICPath1];
                         } else {
                              mainPathsObject[mICPath1] = pathsSingleObject;
                         }


                         let wOperationSingleObject = {};
                         pathsSingleObject.get = wOperationSingleObject;

                         let tagsSingleArray = [];
                         wOperationSingleObject.tags = tagsSingleArray;

                         tagsSingleArray.push(interfaceRealization.target.name);


                         wOperationSingleObject.description = 'Get a list of ' + interfaceRealization.source.name;

                         let parametersSingleArray = [];
                         wOperationSingleObject.parameters = parametersSingleArray;

                         /* -------- Add parameters body 1 -------- */
                         let paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         let objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name1 = end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name;
                         let description1 = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description");

                         //   let name1 = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name;
                         //   let description1 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description");

                         utils.buildParameter(name1, "path", description1, true, objSingleSchema, paramsSingleObject);

                         /* -------- Add parameters body 2 -------- */

                         paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name2 = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name;
                         let description2 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description");
                         utils.buildParameter(name2, "path", description2, true, objSingleSchema, paramsSingleObject);


                         /* -------- Add response body -------- */
                         let responsesSingleObj = {};
                         wOperationSingleObject.responses = responsesSingleObj;

                         let ok200SingleResOjb = {};
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
                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name;
                         //   let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name;

                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }


                         pathsObject.post = this.operations.post(interfaceRealization, end1Interface);


                    } else if (objOperation.name.toUpperCase() == "DELETE") {

                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}";
                         //   let mICPath = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";
                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }

                         pathsObject.delete = this.operations.delete(interfaceRealization, null, end1Interface, end1Interface);

                    } else if (objOperation.name.toUpperCase() == "PUT") {


                         /* Get single element record */

                         let mICPath1 = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}";
                         //   let mICPath1 = "/" + end2Interface.reference.name + "/{" + end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name + "}/" + end1Interface.reference.name + "/{" + end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name + "}";
                         let pathsSingleObject = {};
                         if (mainPathsObject.hasOwnProperty(mICPath1)) {
                              pathsSingleObject = mainPathsObject[mICPath1];
                         } else {
                              mainPathsObject[mICPath1] = pathsSingleObject;
                         }

                         let wOperationSingleObject = {};
                         pathsSingleObject.put = wOperationSingleObject;

                         let tagsSingleArray = [];
                         wOperationSingleObject.tags = tagsSingleArray;

                         tagsSingleArray.push(interfaceRealization.target.name);


                         wOperationSingleObject.description = 'Update an existing ' + interfaceRealization.source.name;

                         let parametersSingleArray = [];
                         wOperationSingleObject.parameters = parametersSingleArray;

                         /* -------- Add parameters body 1 -------- */
                         let paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         let objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name1 = end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name;
                         let description1 = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description");

                         //   let name1 = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name;
                         //   let description1 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description");

                         utils.buildParameter(name1, "path", description1, true, objSingleSchema, paramsSingleObject);

                         /* -------- Add parameters body 2 -------- */

                         paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name2 = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name;
                         let description2 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description");
                         utils.buildParameter(name2, "path", description2, true, objSingleSchema, paramsSingleObject);


                         /* -------- Add response body -------- */
                         let responsesSingleObj = {};
                         wOperationSingleObject.responses = responsesSingleObj;

                         let ok200SingleResOjb = {};
                         responsesSingleObj['200'] = ok200SingleResOjb;

                         ok200SingleResOjb.description = 'OK';

                         let contentSingleObj = {};
                         ok200SingleResOjb.content = contentSingleObj;

                         let appJsonSingleObj = {};
                         contentSingleObj['application/json'] = appJsonSingleObj;

                         let schemaSingleObj = {};
                         appJsonSingleObj.schema = schemaSingleObj;

                         schemaSingleObj['$ref'] = constant.getReference() + interfaceRealization.source.name;

                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }
     }
}

module.exports = Paths;