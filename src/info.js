const openAPI =require('./openapi');
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
          this.mainInfoObj={};
          this.mainInfoObj.description=openAPI.getUMLPackage().name+ ' API - 1.0.0';
          this.mainInfoObj.title=openAPI.getUMLPackage().name+' API';
          this.mainInfoObj.version='1.0.0';
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