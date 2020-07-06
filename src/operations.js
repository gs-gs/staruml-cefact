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
      * @function simpleGET
      * @description returns the object of simple GET method having pattern '/resource'
      * @param {Object} objInterface 
      * @param {Object} objOperation 
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     simpleGET(objInterface, objOperation) {

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
          itemsObject.type = 'object';
          itemsObject.properties = {};

          let objPath = {};
          objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(objInterface.source.name);

          itemsObject.properties[utils.lowerCamelCase(objInterface.source.name)] = objPath;

          schemaObject.type = 'array';

          return wOperationObject;
     }

     /**
      * @function postForSubResource
      * @description returns object of post method
      * @param {UMLInterfaceRealization} interfaceRealization
      * @param {UMLAssociationEnd} end1Interface
      * @param {UMLClass} subResourceClass
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     postForSubResource(interfaceRealization, end1Interface, subResourceClass) {

          let wOperationObject = {};

          let tagsArray = [];

          wOperationObject.tags = tagsArray;

          tagsArray.push(interfaceRealization.target.name);


          wOperationObject.description = 'Create a new ' + interfaceRealization.source.name;

          if (end1Interface != null) {
               let parametersArray = [];
               wOperationObject.parameters = parametersArray;
               let paramsObject = {};
               parametersArray.push(paramsObject);

               let objSchema = {};
               objSchema.type = 'string';

               utils.buildParameter(end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);
          }

          let requestBodyObj = {}
          wOperationObject.requestBody = requestBodyObj;
          utils.buildRequestBodyForSubResource(subResourceClass, requestBodyObj);


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
          schemaObj.type = 'object';
          schemaObj.properties = {};
          let objPath = {};
          objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(subResourceClass.name);
          schemaObj.properties[utils.lowerCamelCase(subResourceClass.name)] = objPath;

          created201Object.description = 'Created';

          return wOperationObject;
     }

     /**
      * @function simplePOST
      * @description returns the object of simple POST method having pattern '/resource'
      * @param {UMLInterface} objInterface
      * @param {UMLAssociationEnd} end2Interface
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     simplePOST(objInterface, end2Interface) {

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

               utils.buildParameter(end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);
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
          schemaObj.type = 'object';
          schemaObj.properties = {};
          let objPath = {};
          objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(objInterface.source.name);
          schemaObj.properties[utils.lowerCamelCase(objInterface.source.name)] = objPath;

          created201Object.description = 'Created';

          return wOperationObject;
     }


     /**
      * @function idPathPUT
      * @description returns the object of id PUT method having pattern '/resource/{id}
      * @param {UMLInterfaceRealization} objInterfaceRealization
      * @param {UMLAttribute} operationAttribute
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     idPathPUT(objInterfaceRealization, operationAttribute) {
          let wOperationObject = {};

          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterfaceRealization.target.name);


          wOperationObject.description = 'Update an existing ' + objInterfaceRealization.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;
          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? utils.buildDescription(operationAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterfaceRealization.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterfaceRealization.target);
               if (mInterfaceView != null) {
                    let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                    forEach(attributeViews, function (attributeView) {
                         mAttributes.push(attributeView.model);
                    });
               }

          }

          /* objInterfaceRealization.target.attributes */
          mAttributes.forEach(itemAttribute => {
               let paramsObject = {};
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier" && itemAttribute.isID != true) {
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), false, objSchema, paramsObject);
                    parametersArray.push(paramsObject);
               }
          });

          let requestBodyObj = {}
          wOperationObject.requestBody = requestBodyObj;

          utils.buildRequestBody(objInterfaceRealization, requestBodyObj);

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
          schemaObj.type = 'object';
          schemaObj.properties = {};
          let objPath = {};
          objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(objInterfaceRealization.source.name);
          schemaObj.properties[utils.lowerCamelCase(objInterfaceRealization.source.name)] = objPath;

          return wOperationObject;
     }

     /**
      * @function idPathPATCH
      * @description returns the object of id PATCH method  having pattern '/resource/{id}
      * @param {UMLInterface} objInterface
      * @param {UMLAttribute} operationAttribute
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     idPathPATCH(objInterface, operationAttribute) {
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

          utils.buildParameter(operationAttribute.name, "path", (operationAttribute.documentation ? utils.buildDescription(operationAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterface.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterface.target);
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
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier" && itemAttribute.isID != true) {
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), false, objSchema, paramsObject);
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
      * @param {UMLInterfaceRealization} objInterfaceRealization
      * @param {UMLAttribute} iAttribute
      * @param {UMLAssociationEnd} end1Interface
      * @param {UMLAssociationEnd} end2Interface
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     delete(objInterfaceRealization, iAttribute, end1Interface, end2Interface) {
          let wOperationObject = {};

          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterfaceRealization.target.name);


          wOperationObject.description = 'Delete an existing ' + objInterfaceRealization.source.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;

          let objSchema = {};
          objSchema.type = 'string';

          if (iAttribute != null && end1Interface == null && end2Interface == null) {

               let paramsObject = {};
               utils.buildParameter(iAttribute.name, "path", (iAttribute.documentation ? utils.buildDescription(iAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);
               parametersArray.push(paramsObject);

               objInterfaceRealization.target.attributes.forEach(itemAttribute => {
                    if (itemAttribute.name != "id" && itemAttribute.name != "identifier" && itemAttribute.isID != true) {
                         let paramsObject1 = {};
                         utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), false, objSchema, paramsObject1);
                         parametersArray.push(paramsObject1);
                    }
               });

          } else if (iAttribute == null && end1Interface != null && end2Interface != null) {

               let paramsObject = {};
               utils.buildParameter(end2Interface.reference.attributes[0].name, "path", (end2Interface.reference.attributes[0].documentation ? utils.buildDescription(end2Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);
               parametersArray.push(paramsObject);

               /* AskQue */
               let paramsObject1 = {};
               utils.buildParameter(end1Interface.reference.attributes[0].name, "path", (end1Interface.reference.attributes[0].documentation ? utils.buildDescription(end1Interface.reference.attributes[0].documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject1);
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
      * @function idPathGET
      * @description returns the object of id GET method  having pattern '/resource/{id}
      * @param {UMLInterfaceRealization} objInterfaceRealization
      * @param {UMLAttribute} iAttribute
      * @returns {Object} wOperationObject
      * @memberof Operations
      */
     idPathGET(objInterfaceRealization, iAttribute) {
          let wOperationObject = {};


          let tagsArray = [];
          wOperationObject.tags = tagsArray;

          tagsArray.push(objInterfaceRealization.target.name);


          wOperationObject.description = 'Get single ' + objInterfaceRealization.source.name + ' by ' + iAttribute.name;

          let parametersArray = [];
          wOperationObject.parameters = parametersArray;

          let paramsObject = {};
          parametersArray.push(paramsObject);

          let objSchema = {};
          objSchema.type = 'string';

          utils.buildParameter(iAttribute.name, "path", (iAttribute.documentation ? utils.buildDescription(iAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), true, objSchema, paramsObject);

          let mAttributes = [];
          if (openAPI.isModelPackage()) {
               mAttributes = objInterfaceRealization.target.attributes;
          } else if (openAPI.isModelDiagram()) {
               let mInterfaceView = utils.getViewFromCurrentDiagram(objInterfaceRealization.target);
               if (mInterfaceView != null) {
                    let attributeViews = utils.getVisibleAttributeView(mInterfaceView)
                    forEach(attributeViews, function (attributeView) {
                         mAttributes.push(attributeView.model);
                    });
               }
          }
          /* objInterfaceRealization.target.attributes */
          mAttributes.forEach(itemAttribute => {
               if (itemAttribute.name != "id" && itemAttribute.name != "identifier" && itemAttribute.isID != true) {
                    let paramsObject = {};
                    utils.buildParameter(itemAttribute.name, "query", (itemAttribute.documentation ? utils.buildDescription(itemAttribute.documentation) : constant.STR_MISSING_DESCRIPTION), false, objSchema, paramsObject);
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
          schemaObj.type = 'object';
          schemaObj.properties = {};
          let objPath = {};
          objPath ['$ref'] = constant.getReference() + utils.upperCamelCase(objInterfaceRealization.source.name);
          schemaObj.properties[utils.lowerCamelCase(objInterfaceRealization.source.name)] = objPath;

          return wOperationObject;
     }
}

module.exports = Operations;