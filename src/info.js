const openAPI = require('./openapi');
const version=require('../package.json').version
/**
 *
 *
 * @class Info
/**
 * Info class returns the API Info 
 *
 * @class Info
 */
class Info {
     /**
      * Creates an instance of Info.
      * 
      * @constructor Info
      */
     constructor() {
          this.mainInfoObj = {};
          this.mainInfoObj.description = openAPI.getUMLPackage().name + ' API - '+version;
          this.mainInfoObj.title = openAPI.getUMLPackage().name + ' API';
          this.mainInfoObj.version = version;
     }


     /**
      * Return Info object 
      * 
      * @function getData
      * @return {string}
      */
     getInfo() {
          return this.mainInfoObj;
     }

}

module.exports = Info;