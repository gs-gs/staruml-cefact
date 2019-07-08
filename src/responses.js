/**
 *
 *
 * @class Responses
 */
class Responses {
     /**
      * Creates an instance of Responses.
      * 
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
          // wOperationObject.responses=responsesObject;

          let ok200Object={}
          responsesObject['200']=ok200Object;

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

          return responsesObject;
     }

}

exports.Responses = Responses;