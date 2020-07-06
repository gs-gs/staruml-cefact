const forEach = require('async-foreach').forEach;
const utils = require('./utils');
const openAPI = require('./openapi');
const constant = require('./constant');
const Operations = require('./operations');
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
          /* this.generalization = new Generalization(); */
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
               interfaceRealalization = utils.fetchUMLInterfaceRealization();

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

                         /* 
                         
                         GET : 

                              Examples : 
                                   GET http://www.appdomain.com/users
                                   GET http://www.appdomain.com/users?size=20&page=5
                                   GET http://www.appdomain.com/users/123
                                   GET http://www.appdomain.com/users/123/address
                              
                              Generating : 
                                   '/{resource}'
                                   '/{resource}?params1=abc&params2=xyz...' (query parameter)
                                   '/{resource}/{id}'
                                   '/{resource}/{id}/{sub-resource}
                                   '/{resource}/{id}/{sub-resource}/{sub-resource-id}' // This is not listed in restfullapi.net
                         
                         POST : 

                              Examples : 
                                   POST http://www.appdomain.com/users
                                   POST http://www.appdomain.com/users/123/accounts

                              Generating : 
                                   '/{resource}'
                                   '/{resource}/{id}/{sub-resource}'

                         PUT :

                              Examples : 
                                   PUT http://www.appdomain.com/users/123
                                   PUT http://www.appdomain.com/users/123/accounts/456

                              Generating :
                                   '/{resource}/{id}'
                                   '/{resource}/{id}/{sub-resource}/{sub-resource-id}'
                         
                         PATCH :

                              Examples :
                                   PATCH http://www.appdomain.com/users/123
                                   PATCH http://www.appdomain.com/users/123/accounts/456

                              Generating :
                                   '/{resource}/{id}'  

                         DELETE : 

                              Examples :
                                   DELETE http://www.appdomain.com/users/123
                                   DELETE http://www.appdomain.com/users/123/accounts/456

                              Generating :
                                   '/{resource}/{id}'
                                   '/{resource}/{id}/{sub-resource}/{sub-resource-id}'

                         
                         /* 
                         1. Write Simple path 

                              Pattern : (GET/POST) : '/{resource}'

                              Note : in GET method : If paramter name is not 'id' or 'identifier', Generate 'query' parameter (Issue : #6)

                         */
                         this.writeSimplePathObject(pathsObject, mOperations, objInterfaceRealization);

                         /* 
                         2. Write {id} path object of (GET, PUT, DELETE, PATCH) Operations

                              Pattern : (GET/PUT/DELETE/PATCH) : '/{resource}/{id}'

                         */
                         this.writeIDPathObject(mInterfaceView, objInterface, mOperations, mainPathsObject, objInterfaceRealization);

                         /* 
                         3. Write path object for sub-resource pattern (Issue : #90) 
                              Pattern : 

                              GET : '/{resource}/{id}/{sub-resource}'
                              GET : '/{resource}/{id}/{sub-resource}/{sub-resource-id}'

                              POST : '/{resource}/{id}/{sub-resource}'

                              DELETE : '/{resource}/{id}/{sub-resource}/{sub-resource-id}'

                              PUT : '/{resource}/{id}/{sub-resource}/{sub-resource-id}'
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


               let interfaceAssociation = utils.fetchUMLAssociation();

               let resFilter = interfaceAssociation.filter(function (item) {
                    return (item.end1.aggregation == 'composite' && item.end1.reference._id == objInterface._id);
               });


               let filterInterfaceAssociation = resFilter.filter(function (item) {
                    return item.end2.aggregation == 'none';
               });


               filterInterfaceAssociation.forEach(interAsso => {
                    if (interAsso instanceof type.UMLAssociation) {
                         if (interAsso.end1.aggregation == "composite" && interAsso.end2.aggregation == "none") {
                              this.writeInterfaceComposite(objInterfaceRealization, interAsso, mainPathsObject);
                         }
                    }
               });

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
     writeSimplePathObject(pathsObject, mOperations, objInterfaceRealization) {
          mOperations.forEach(objOperation => {

               if (objOperation.name.toUpperCase() == constant.GET) {
                    pathsObject.get = this.operations.simpleGET(objInterfaceRealization, objOperation);


               } else if (objOperation.name.toUpperCase() == constant.POST) {
                    pathsObject.post = this.operations.simplePOST(objInterfaceRealization, null);

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
               return item.name == constant.GET || item.name == constant.PUT || item.name == constant.DELETE || item.name == constant.PATCH;
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
                    return item.name == "id" || item.name == "identifier" || item.isID == true;
               });
               interfaceAttributes.forEach(iAttribute => {


                    /* Filter for visible attribute Views from diagram elements (Class & Interface) */

                    mainPathsObject["/" + objInterface.name + '/{' + iAttribute.name + '}'] = pathsObject


                    mOperations.forEach(objOperation => {


                         /* Filter for visible operation Views from diagram elements (Interface) */

                         let wOperationObject = {};
                         if (objOperation.name.toUpperCase() == constant.GET) {
                              pathsObject.get = wOperationObject;
                              pathsObject.get = this.operations.idPathGET(objInterfaceRealization, iAttribute)
                         } else if (objOperation.name.toUpperCase() == constant.DELETE) {
                              pathsObject.delete = this.operations.delete(objInterfaceRealization, iAttribute, null, null);
                         } else if (objOperation.name.toUpperCase() == constant.PUT) {
                              pathsObject.put = this.operations.idPathPUT(objInterfaceRealization, iAttribute);
                         } else if (objOperation.name.toUpperCase() == constant.PATCH) {
                              pathsObject.patch = this.operations.idPathPATCH(objInterfaceRealization, iAttribute);
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

               if (end1Interface.reference.attributes[0].name == end2Interface.reference.attributes[0].name) {
                    let duplicateAttriMsg = 'The interface "' + end2Interface.reference.name + '" has the same name "' + end1Interface.reference.attributes[0].name + '" for \'id\' attribute as the interface "' + end1Interface.reference.name + '", they must be different to generate the paths for sub-resource.';
                    app.dialogs.showAlertDialog(duplicateAttriMsg);
                    return;
               }

               let uIR = app.repository.select("@UMLInterfaceRealization");
               let resUIR = uIR.filter(irealization => {
                    return end2Interface.reference._id == irealization.target._id;
               });
               end2Interface.reference.operations.forEach(objOperation => {
                    /* interfaceRealization.target.operations.forEach(objOperation => { */
                    /* Filter for visible operation Views from diagram elements (Interface) */


                    let pathsObject = {};
                    let wOperationObject = {};
                    let refCName = '';
                    if (objOperation.name.toUpperCase() == constant.GET) {

                         /* GET all sub-resource list */

                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name;

                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }


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

                         let name = end1Interface.reference.attributes[0].name;
                         let description = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION);

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

                         refCName = '';
                         if (resUIR.length == 1) {
                              let subResourceClass = resUIR[0].source;
                              refCName = subResourceClass.name
                         } else {
                              /*  This line is optional */
                              refCName = interfaceRealization.source.name;
                         }

                         let itemsObject = {};
                         schemaObj.items = itemsObject;
                         itemsObject.type = 'object';
                         itemsObject.properties = {};

                         let objPath = {};
                         objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(refCName);

                         itemsObject.properties[utils.lowerCamelCase(refCName)] = objPath;
                         schemaObj.type = 'array';
                         /* schemaObj['$ref'] = constant.getReference() + utils.upperCamelCase(refCName); */



                         /* GET single sub-resource */

                         let mICPath1 = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}";

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

                         let name1 = end1Interface.reference.attributes[0].name;
                         let description1 = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION);

                         /* let name1 = end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name; */
                         /* let description1 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION); */

                         utils.buildParameter(name1, "path", description1, true, objSingleSchema, paramsSingleObject);

                         /* -------- Add parameters body 2 -------- */

                         paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name2 = end2Interface.reference.attributes[0].name;
                         let description2 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION);
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

                         refCName = '';
                         if (resUIR.length == 1) {
                              let subResourceClass = resUIR[0].source;
                              refCName = subResourceClass.name
                         } else {
                              /* This line is optional */
                              refCName = interfaceRealization.source.name;
                         }

                         schemaSingleObj.type = 'object';
                         schemaSingleObj.properties = {};
                         let objPathSchemaSingleObj = {};
                         objPathSchemaSingleObj ['$ref'] = constant.getReference() + utils.upperCamelCase(refCName);
                         schemaSingleObj.properties[utils.lowerCamelCase(refCName)] = objPathSchemaSingleObj;




                    } else if (objOperation.name.toUpperCase() == constant.POST) {

                         /* POST single sub-resource */

                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name;

                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }

                         if (resUIR.length == 1) {
                              let subResourceClass = resUIR[0].source;
                              pathsObject.post = this.operations.postForSubResource(interfaceRealization, end1Interface, subResourceClass);
                         }



                    } else if (objOperation.name.toUpperCase() == constant.DELETE) {


                         /* PUT single sub-resource */
                         let mICPath = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}";

                         if (mainPathsObject.hasOwnProperty(mICPath)) {
                              pathsObject = mainPathsObject[mICPath];
                         } else {
                              mainPathsObject[mICPath] = pathsObject;
                         }

                         pathsObject.delete = this.operations.delete(interfaceRealization, null, end1Interface, end2Interface);

                    } else if (objOperation.name.toUpperCase() == constant.PUT) {

                         /* PUT single sub-resource */


                         let mICPath1 = "/" + end1Interface.reference.name + "/{" + end1Interface.reference.attributes[0].name + "}/" + end2Interface.reference.name + "/{" + end2Interface.reference.attributes[0].name + "}";

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

                         let name1 = end1Interface.reference.attributes[0].name;
                         let description1 = (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION);

                         utils.buildParameter(name1, "path", description1, true, objSingleSchema, paramsSingleObject);

                         /* -------- Add parameters body 2 -------- */

                         paramsSingleObject = {};
                         parametersSingleArray.push(paramsSingleObject);

                         objSingleSchema = {};
                         objSingleSchema.type = 'string';

                         let name2 = end2Interface.reference.attributes[0].name;
                         let description2 = (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION);
                         utils.buildParameter(name2, "path", description2, true, objSingleSchema, paramsSingleObject);

                         if (resUIR.length == 1) {
                              let subResourceClass = resUIR[0].source;
                              let requestBodyObj = {}
                              wOperationSingleObject.requestBody = requestBodyObj;
                              utils.buildRequestBodyForSubResource(subResourceClass, requestBodyObj);
                         }


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

                         refCName = '';
                         if (resUIR.length == 1) {
                              let subResourceClass = resUIR[0].source;
                              refCName = subResourceClass.name
                         } else {
                              /* This line is optional */
                              refCName = interfaceRealization.source.name;
                         }

                         schemaSingleObj.type = 'object';
                         schemaSingleObj.properties = {};
                         let objPathSchemaSingleObj = {};
                         objPathSchemaSingleObj ['$ref'] = constant.getReference() + utils.upperCamelCase(refCName);
                         schemaSingleObj.properties[utils.lowerCamelCase(refCName)] = objPathSchemaSingleObj;
                    }
               });
          } catch (error) {
               console.error("Found error", error.message);
               utils.writeErrorToFile(error);
          }
     }
}

module.exports = Paths;