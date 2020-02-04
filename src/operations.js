const forEach = require('async-foreach').forEach;
const openAPI = require('./openapi');
const constant = require('./constant');
const utils = require('./utils')
/**
 * @class Operations
 * @description class returns the Operations
 */
class Operations {
     /**
      * @constructor Creates an instance of Operations.
      */
     constructor() {
          utils.resetErrorBlock();
     }

     /**
      * @function get
      * @description returns the object of get method
      * @param {UMLInterface} objInterface 
      * @param {objOperation} objOperation
      * @returns {Object} 
      * @memberof Operations
      */
     get(objInterface, objOperation) {

          let wOperationObject = {};

          let tagsArray = [];


          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterface.target.name);


          wOperationObject.description = 'Get a list of ' + objInterface.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;

          utils.writeQueryParameters(parametersArray, objOperation);

          let responsesObject = {};
          wOperationObject.responses = responsesObject;

          let ok200Object = {}
          responsesObject['200'] = ok200Object;

          ok200Object.description = 'OK';

          let contentObject = {};
          ok200Object.content = contentObject;

          let appJsonObject = {};
          contentObject['application/json'] = appJsonObject;

          let schemaObject = {};
          appJsonObject.schema = schemaObject;

          let itemsObject = {};
          schemaObject.items = itemsObject;
          itemsObject['$ref'] = constant.getReference() + objInterface.source.name;

          schemaObject.type = 'array';

          return wOperationObject;
     }

     /**
      * @function post
      * @description returns object of post method
      * @param {UMLInterface} objInterface
      * @param {UMLInterface} end2Interface
      * @returns {Object}
      * @memberof Operations
      */
     post(objInterface, end2Interface) {

          let wOperationObject = {};

          let tagsArray = [];

          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterface.target.name);


          wOperationObject.description = 'Create a new ' + objInterface.source.name;

          if (end2Interface != null) {
               let parametersArray = [];
               wOperationObject.parameters = parametersArray;
               let paramsObject = {};
               parametersArray.push(paramsObject);

               let objSchema = {};
               objSchema.type = 'string';

               utils.buildParameter(end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema, paramsObject);
          }

          let requestBodyObj = {}
          wOperationObject.requestBody = requestBodyObj;
          utils.buildRequestBody(objInterface, requestBodyObj);


          let responsesObject = {};
          wOperationObject.responses = responsesObject;

          let created201Object = {};
          responsesObject['201'] = created201Object;

          let contentObj = {};
          created201Object.content = contentObj;

          let appJsonObj = {};
          contentObj['application/json'] = appJsonObj;

          let schemaObj = {};
          appJsonObj.schema = schemaObj;
          schemaObj['$ref'] = constant.getReference() + objInterface.source.name;

          created201Object.description = 'Created';

          return wOperationObject;
     }


     /**
      * @function put
      * @description returns the object of put method
      * @param {UMLInterface} objInterRealization
      * @param {UMLAttribute} operationAttribute
      * @returns {Object}
      * @memberof Operations
      */
     put(objInterRealization, operationAttribute) {
          let wOperationObject = {};

          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterRealization.target.name);


          wOperationObject.description = 'Update an existing ' + objInterRealization.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;
          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterRealization.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterRealization.target);
               if (mInterfaceView != null) {
                    let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                    forEach(attributeViews, function (attributeView) {
                         mAttributes.push(attributeView.model);
                    });
               }

          }

          /* objInterRealization.target.attributes */
          mAttributes.forEach(itemAttribute => {
               let paramsObject = {};
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema, paramsObject);
                    parametersArray.push(paramsObject);
               }
          });

          let requestBodyObj = {}
          wOperationObject.requestBody = requestBodyObj;

          utils.buildRequestBody(objInterRealization, requestBodyObj);

          let resObj = {};
          wOperationObject.responses = resObj;

          let ok200Obj = {};
          resObj['200'] = ok200Obj;

          ok200Obj.description = 'OK';

          let contentObj = {};
          ok200Obj.content = contentObj;

          let appJsonObj = {};
          contentObj['application/json'] = appJsonObj;

          let schemaObj = {};
          appJsonObj.schema = schemaObj;
          schemaObj['$ref'] = constant.getReference() + objInterRealization.source.name;

          return wOperationObject;
     }

     /**
      * @function patch
      * @description returns the object of patch method
      * @param {UMLInterface} objInterface
      * @param {UMLAttribute} operationAttribute
      * @returns {Object}
      * @memberof Operations
      */
     patch(objInterface, operationAttribute) {
          let wOperationObject = {};

          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterface.target.name);


          wOperationObject.description = 'Update ' + objInterface.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;
          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? utils.buildDescription(operationAttribute.documentation) : "missing description"), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterRealization.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterRealization.target);
               if (mInterfaceView != null) {
                    let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                    forEach(attributeViews, function (attributeView) {
                         mAttributes.push(attributeView.model);
                    });
               }

          }

          /* objInterface.target.attributes */
          mAttributes.forEach(itemAttribute => {
               let paramsObject = {};
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema, paramsObject);
                    parametersArray.push(paramsObject);
               }
          });

          let requestBodyObj = {}
          wOperationObject.requestBody = requestBodyObj;
          utils.buildRequestBody(objInterface, requestBodyObj);

          let resObj = {};
          wOperationObject.responses = resObj;


          let noContentObj = {};
          resObj['204'] = noContentObj;
          noContentObj.description = 'No Content';

          return wOperationObject;
     }

     /**
      * @function delete
      * @description Returns the object of delete method
      * @param {UMLInterface} objInterRealization
      * @param {UMLAttribute} iAttribute
      * @param {UMLAssociationEnd} end1Interface
      * @param {UMLAssociationEnd} end2Interface
      * @returns {Object}
      * @memberof Operations
      */
     delete(objInterRealization, iAttribute, end1Interface, end2Interface) {
          let wOperationObject = {};

          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterRealization.target.name);


          wOperationObject.description = 'Delete an existing ' + objInterRealization.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;
          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          if (iAttribute != null && end1Interface == null && end2Interface == null) {

               utils.buildParameter(iAttribute.name, "path", (iAttribute.documentation ? utils.buildDescription(iAttribute.documentation) : "missing description"), true, objSchema, paramsObject);

               objInterRealization.target.attributes.forEach(itemAttribute => {
                    let paramsObject = {};
                    if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                         utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema, paramsObject);
                         parametersArray.push(paramsObject);
                    }
               });

          } else if (iAttribute == null && end1Interface != null && end2Interface != null) {

               utils.buildParameter(end2Interface.reference.name + "_" + end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema, paramsObject);

               /* AskQue */
               let paramsObject1 = {};
               utils.buildParameter(end1Interface.reference.name + "_" + end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : "missing description"), true, objSchema, paramsObject1);
               parametersArray.push(paramsObject1);

          }

          let resObj = {};
          wOperationObject.responses = resObj;

          let noContent204Obj = {};
          resObj['204'] = noContent204Obj;
          noContent204Obj.description = 'No Content';

          return wOperationObject;
     }

     /**
      * @function getOperationAttribute
      * @description returns the attributes object of Operation object
      * @param {UMLInterface} objInterRealization
      * @param {UMLAttribute} iAttribute
      * @returns {Object}
      * @memberof Operations
      */
     getOperationAttribute(objInterRealization, iAttribute) {
          let wOperationObject = {};


          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterRealization.target.name);


          wOperationObject.description = 'Get single ' + objInterRealization.source.name + ' by ' + iAttribute.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;

          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          utils.buildParameter(iAttribute.name, "path", (iAttribute.documentation ? utils.buildDescription(iAttribute.documentation) : "missing description"), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterRealization.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterRealization.target);
               if (mInterfaceView != null) {
                    let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                    forEach(attributeViews, function (attributeView) {
                         mAttributes.push(attributeView.model);
                    });
               }
          }
          /* objInterRealization.target.attributes */
          mAttributes.forEach(itemAttribute => {
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier") {
                    let paramsObject = {};
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : "missing description"), false, objSchema, paramsObject);
                    parametersArray.push(paramsObject);
               }
          })

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
          schemaObj['$ref'] = constant.getReference() + objInterRealization.source.name;

          return wOperationObject;
     }
}

module.exports = Operations;