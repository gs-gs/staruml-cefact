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
          var version = '';
          var description = '';
          if (openAPI.getUMLPackage().hasOwnProperty('documentation')) {
               var re = openAPI.getUMLPackage().documentation.split("\n");
               if (re.length >= 1) {
                    var verArr = re[0].split(":")
                    if (verArr.length > 1) {
                         version = verArr[1];
                    }
               }
               if (re.length > 1) {
                    description = re[1] + '<br><br>' + constant.msg_description;
               }
          }
          this.mainInfoObj = {};
          this.mainInfoObj.description = description;
          this.mainInfoObj.title = openAPI.getUMLPackage().name;
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