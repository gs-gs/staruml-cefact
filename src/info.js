const openAPI = require('./openapi');
const version=require('../package.json').version
const constant = require('../src/constant');
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
          var version='';
          var description='';
          if(openAPI.getUMLPackage().hasOwnProperty('documentation')){
               var re = openAPI.getUMLPackage().documentation.split("\n");
               if(re.length>=1){
                    var verArr=re[0].split(":")
                    if(verArr.length>1){
                         version=verArr[1];
                    }
               }
               if(re.length>1){
                    description=re[1]+'<br><br>'+constant.msg_description;
               }
               console.log("version",version);
               console.log("description",description);
               
               
          }
          this.mainInfoObj = {};
          this.mainInfoObj.description = description;
          this.mainInfoObj.title = openAPI.getUMLPackage().name;
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