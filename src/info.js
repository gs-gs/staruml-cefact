const openAPI = require('./openapi');
const constant = require('../src/constant');

/**
 * @class Info 
 * @description class returns the API Info 
 */
class Info {
     /**
      * @constructor Creates an instance of Info.
      */
     constructor() {
          var version = 'Please specify version in Project properties';
          var description = '';
          if (openAPI.getExportElement().hasOwnProperty('documentation')) {
               var docs = openAPI.getExportElement().documentation.split("\n");
               for (let i in docs){
                    description += docs[i] + '<br>';
               }
               description += '<br>';
          }
          var parent = openAPI.getExportElement()['_parent'];
          while (parent!= null) {
               if (parent.hasOwnProperty('version')){
                    version = parent['version'];
                    break;
               } else {
                    parent = parent['_parent'];
               }
          }

          description += constant.msg_description;
          this.mainInfoObj = {};
          this.mainInfoObj.description = description;
          this.mainInfoObj.title = openAPI.getExportElementName();
          this.mainInfoObj.version = version;
     }


     /**
      * @function getInfo
      * @description Return Info object 
      * @return {Object}
      * @memberof Info
      */
     getInfo() {
          return this.mainInfoObj;
     }

}

module.exports = Info;