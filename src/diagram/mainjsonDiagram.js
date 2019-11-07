/**
 * @class MainJSONDiagram 
 * @description class returns the API MainJSONDiagram 
 */
class MainJSONDiagram {
     /**
      * @constructor Creates an instance of MainJSONDiagram.
      */
     constructor() {
          MainJSONDiagram.mainOpenApiObj = {};
     }

     /**
      * @function saveComponent
      * @description save component object to main json
      * @static
      * @param {Object} component
      * @memberof MainJSONDiagram
      */
     static saveComponent(component) {
          MainJSONDiagram.mainOpenApiObj.components = component.getComponent();
     }

     /**
      * @function saveInfo
      * @description save Info object to main json
      * @static
      * @param {Object} mInfo
      * @memberof MainJSONDiagram
      */
     static saveInfo(mInfo) {
          MainJSONDiagram.mainOpenApiObj.info = mInfo.getInfo();
     }

     /**
      * @function saveApiVersion
      * @description save api version to main json
      * @static
      * @param {string} version
      * @memberof MainJSONDiagram
      */
     static saveApiVersion(version) {
          MainJSONDiagram.mainOpenApiObj.openapi = version;
     }

     /**
      * @function savePaths
      * @description save path object to main json
      * @static
      * @param {object} mPaths
      * @memberof MainJSONDiagram
      */
     static savePaths(mPaths) {
          MainJSONDiagram.mainOpenApiObj.paths = mPaths.getOperations();
     }

     /**
      * @function saveServers
      * @description save server array to main json
      * @static
      * @param {Array} servers
      * @memberof MainJSONDiagram
      */
     static saveServers(servers) {
          MainJSONDiagram.mainOpenApiObj.servers = servers.getServers();
     }

     /**
      * @function giveJson
      * @description give the main json 
      * @static
      * @memberof MainJSONDiagram
      */
     static giveJson() {
          return MainJSONDiagram.mainOpenApiObj;
     }
}
module.exports.MainJSONDiagram = new MainJSONDiagram();
module.exports.addComponent = MainJSONDiagram.saveComponent;
module.exports.addInfo = MainJSONDiagram.saveInfo;
module.exports.addApiVersion = MainJSONDiagram.saveApiVersion;
module.exports.addPaths = MainJSONDiagram.savePaths;
module.exports.addServers = MainJSONDiagram.saveServers;
module.exports.getJSON = MainJSONDiagram.giveJson;