const Utils=require('./utils');
/**
 *
 *
 * @class Properties
/**
 * Properties class returns the Attributes available in class 
 *
 * @class Properties
 */
class Properties {
     /**
      * Creates an instance of Properties.
      * 
      * @constructor Properties
      */
     constructor(objClass,assocSideClassLink) {
          this.objClass=objClass;
          this.assocSideClassLink=assocSideClassLink;
          this.arrAttr=[];
          this.utils=new Utils();    
     }

     /**
      *
      *
      * @returns 
      * @memberof Properties
      */
     getAttributes(){
          return this.arrAttr;
     }

    /**
     *
     *
     * @returns
     * @memberof Properties
     */
    addProperties(){
          let mainPropertiesObj={};
          this.arrAttr = [];

               let i, len;
               let propertiesObj={};
               for (i = 0, len = this.objClass.attributes.length; i < len; i++) {
                    propertiesObj={};
                    let attr = this.objClass.attributes[i];
                    let filterAttr = this.arrAttr.filter(item => {
                         return item.name == attr.name;
                    });
                    if (filterAttr.length == 0) {
                         this.arrAttr.push(attr);
                         if (this.assocSideClassLink.length > 0 && attr.isID) {
                              continue;
                         }
                         // if(!attr.isID ){
                         mainPropertiesObj[attr.name]=propertiesObj;
                         if (attr.multiplicity === "1..*" || attr.multiplicity === "0..*") {
                              let itemsObj={};
                              propertiesObj.items=itemsObj;
                              itemsObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                              itemsObj.type=this.utils.getType(attr.type);

                              

                              propertiesObj.type='array';
                              /**
                               * Add MinItems of multiplicity is 1..*
                               */
                              if (attr.multiplicity === "1..*") {
                                   propertiesObj.minItems=1;
                              }
                         } else {
                              propertiesObj.description=(attr.documentation ? this.utils.buildDescription(attr.documentation) : "missing description");

                              propertiesObj.type=this.utils.getType(attr.type);

                              if (attr.type instanceof type.UMLEnumeration) {
                                   propertiesObj.enum=this.utils.getEnumerationLiteral(attr.type);
                              }
                         }
                         if (attr.defaultValue != "") {
                              propertiesObj.default=attr.defaultValue;
                         }
                         // }

                    }
               }
          return mainPropertiesObj;
     }

     
}

module.exports = Properties;