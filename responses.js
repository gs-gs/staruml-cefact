/**
 *
 *
 * @class Responses
 */
class Responses {
     /**
      * Creates an instance of Responses.
      * 
      * @param {string} indentString
      * @constructor Responses
      */
     constructor() {
     }

     /**
      * Return object result as 200
      * 
      * @function getOk200Response
      * @param {Interface} objInterface
      * @return {Object}
      */
     getOk200Response(objInterface) {

          let responsesObject={};
          // codeWriter.writeLine("responses:", 0, 0);
          // wOperationObject.responses=responsesObject;

          let ok200Object={}
          // codeWriter.writeLine("'200':", 1, 0);
          responsesObject['200']=ok200Object;

          let contentObject={};
          // codeWriter.writeLine("content:", 1, 0);
          ok200Object.content=contentObject;

          let appJsonObject={};
          // codeWriter.writeLine("application/json:", 1, 0);
          contentObject['application/json']=appJsonObject;

          let schemaObject={};
          // codeWriter.writeLine("schema:", 1, 0);
          appJsonObject.schema=schemaObject;

          let itemsObject={};
          // codeWriter.writeLine("items: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 0);
          schemaObject.items=itemsObject;
          itemsObject['$ref']='#/components/schemas/' + objInterface.source.name;

          // codeWriter.writeLine("type: array", 0, 3);
          schemaObject.type='array';

          // codeWriter.writeLine("description: OK", 0, 3);
          ok200Object.description='OK';

          return responsesObject;
     }

     /**
      * Return object result as 201
      * 
      * @function getCreated201Response
      * @param {Interface} objInterface
      * @return {Object}
      */
     getCreated201Response(objInterface) {

          let responsesObject={};
          // codeWriter.writeLine("responses:", 0, 0);
          wOperationObject.responses=responsesObject;

          let created201Object={};
          // codeWriter.writeLine("'201':", 1, 0);
          responsesObject['201']=created201Object;

          let contentObj={};
          // codeWriter.writeLine("content:", 1, 0);
          created201Object.content=contentObj;

          let appJsonObj={};
          // codeWriter.writeLine("application/json:", 1, 0);
          contentObj['application/json']=appJsonObj;

          let schemaObj={};
          // codeWriter.writeLine("schema: {$ref: '#/components/schemas/" + objInterface.source.name + "'}", 1, 2);
          appJsonObj.schema=schemaObj;
          schemaObj['$ref']='#/components/schemas/' + objInterface.source.name;


          // codeWriter.writeLine("description: Created", 0, 3);
          created201Object.description='Created';

          return responsesObject;
     }

}

exports.Responses = Responses;