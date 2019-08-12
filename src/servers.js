/**
 * @class Server
 * @description Server class returns the API Server 
 */
class Servers {
     /**
      * @constructor Creates an instance of Server.
      */
     constructor() {
          this.servers = [];

     }


     /**
      * @function getServers
      * @description Return Server object 
      * @return {Object}
      */
     getServers() {
          return this.servers;
     }
}

module.exports = Servers;