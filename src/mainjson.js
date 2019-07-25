/**
 *
 *
 * @class MainJSON
/**
 * MainJSON class returns the API MainJSON 
 *
 * @class MainJSON
 */
class MainJSON {
     /**
      * Creates an instance of MainJSON.
      * 
      * @constructor MainJSON
      */
     constructor() {
          MainJSON.mainOpenApiObj = {};
     }

     /**
      * @function saveComponent
      * @description save component object to main json
      * @static
      * @param {Object} component
      * @memberof MainJSON
      */
     static saveComponent(component) {
          MainJSON.mainOpenApiObj.components = component.getComponent();
     }

     /**
      * @function saveInfo
      * @description save Info object to main json
      * @static
      * @param {Object} mInfo
      * @memberof MainJSON
      */
     static saveInfo(mInfo) {
          MainJSON.mainOpenApiObj.info = mInfo.getInfo();
     }

     /**
      * @function saveApiVersion
      * @description save api version to main json
      * @static
      * @param {string} version
      * @memberof MainJSON
      */
     static saveApiVersion(version) {
          MainJSON.mainOpenApiObj.openapi = version;
     }

     /**
      * @function savePaths
      * @description save path object to main json
      * @static
      * @param {object} mPaths
      * @memberof MainJSON
      */
     static savePaths(mPaths) {
          MainJSON.mainOpenApiObj.paths = mPaths.getOperations();
     }

     /**
      * @function saveServers
      * @description save server array to main json
      * @static
      * @param {Array} servers
      * @memberof MainJSON
      */
     static saveServers(servers) {
          MainJSON.mainOpenApiObj.servers = servers.getServers();
     }

     /**
      * @function giveJson
      * @description give the main json 
      * @static
      * @memberof MainJSON
      */
     static giveJson() {
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