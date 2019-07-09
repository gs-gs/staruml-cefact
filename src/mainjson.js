/**
 *
 *
 * @class MainJSON
/**
 * MainJSON class returns the API MainJSON 
 *
 * @class Info
 */
class MainJSON {
     /**
      * Creates an instance of Info.
      * 
      * @constructor Info
      */
     constructor() {
          MainJSON.mainOpenApiObj={};
          
     }

     
     static saveComponent(component)
     {
          MainJSON.mainOpenApiObj.components=component.getComponent();
     }

     static saveInfo(mInfo){
          MainJSON.mainOpenApiObj.info=mInfo.getInfo();
     }

     static saveApiVersion(version){
          MainJSON.mainOpenApiObj.openapi=version;
     }

     static savePaths(mPaths){
          MainJSON.mainOpenApiObj.paths=mPaths.getOperations();
     }

     static saveServers(servers){
          MainJSON.mainOpenApiObj.servers=servers.getServers();
     }

     static giveJson(){
          return MainJSON.mainOpenApiObj;
     }
}
module.exports.MainJSON = new MainJSON();
module.exports.addComponent = MainJSON.saveComponent;
module.exports.addInfo = MainJSON.saveInfo;
module.exports.addApiVersion = MainJSON.saveApiVersion;
module.exports.addPaths = MainJSON.savePaths;
module.exports.addServers = MainJSON.saveServers;
module.exports.getJSON = MainJSON.giveJson;