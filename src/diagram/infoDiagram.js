const diagramEle = require('./diagramElement');
const constant = require('../constant');

/**
 * @class InfoDiagram 
 * @description class returns the API InfoDiagram 
 */
class InfoDiagram {
     /**
      * @constructor Creates an instance of InfoDiagram.
      */
     constructor() {
          var version = '';
          var description = '';
          if (diagramEle.getUMLPackage().hasOwnProperty('documentation')) {
               var re = diagramEle.getUMLPackage().documentation.split("\n");
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
          this.mainInfoObj.title = diagramEle.getUMLPackage().name;
          this.mainInfoObj.version = version;
     }


     /**
      * @function getInfo
      * @description Return InfoDiagram object 
      * @return {Object}
      * @memberof InfoDiagram
      */
     getInfo() {
          return this.mainInfoObj;
     }

}

module.exports = InfoDiagram;