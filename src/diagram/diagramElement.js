console.log("---structure : diagramElement.js");
const MainJSONDiagram = require('./mainjsonDiagram');
const fs = require('fs');
const Info = require('../info');
// const Component = require('../component');
const ComponentDiagram = require('./componentDiagram');
const Utils = require('../utils');
const utils = new Utils();
const FileGenerator = require('../filegenerator');
const Paths = require('../paths');
const Servers = require('../servers');
const constant = require('../constant');
const SwaggerParser = require("swagger-parser");
let parser = new SwaggerParser();
var forEach = require('async-foreach').forEach;
const openAPI = require('../openapi');


let UMLClass = null;
let UMLInterface = null;
let UMLAssociation = null;
let UMLGeneralization = null;
let UMLInterfaceRealization = null;
let UMLEnumeration = null;
let UMLAssociationClassLink = null;
let AllElement = null;
/**
 * @function setUMLDiagramElement
 * @description save & sort all element from UMLClassDiagram 
 * @param {Array} mAllElement
 */
function setUMLDiagramElement(mAllElement) {
    mAllElement.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    AllElement = mAllElement;
}
/**
 * @function getUMLDiagramElement
 * @description returns all element from UMLClasssDiagram
 * @returns {Array} AllElement
 */
function getUMLDiagramElement() {
    return AllElement;
}
/**
 * @function setUMLClass
 * @description save UMLClass from UMLClassDiagram
 * @param {Array} mUMLClass
 */
function setUMLClass(mUMLClass) {
    console.log("UMLClasses", mUMLClass);
    UMLClass = mUMLClass
}
/**
 * @function getUMLClass
 * @description retuns the Array of UMLClass from UMLClassDiagra
 * @returns {Array} UMLClass
 */
function getUMLClass() {
    return UMLClass;
}
/**
 * @function setUMLInterface
 * @description save array of UMLInterface from UMLClassDiagram
 * @param {Array} mUMLInterface
 */
function setUMLInterface(mUMLInterface) {
    mUMLInterface.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLInterface", mUMLInterface);
    UMLInterface = mUMLInterface;
}
/**
 * @function getUMLInterface
 * @description returns array of UMLInterface from UMLClassDiagram
 * @returns {Array} UMLInterface
 */
function getUMLInterface() {
    return UMLInterface;
}
/**
 * @function setUMLAssociation
 * @description save and sort UMLAssociation from UMLClassDiagram
 * @param {Array} mUMLAssociation
 */
function setUMLAssociation(mUMLAssociation) {
    mUMLAssociation.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLAssociation", mUMLAssociation);
    UMLAssociation = mUMLAssociation;
}
/**
 * @function getUMLAssociation
 * @description returns array of UMLAssociation from UMLClassDiagram
 * @returns {Array} UMLAssociation
 */
function getUMLAssociation() {
    return UMLAssociation;
}
/**
 * @function setUMLGeneralization
 * @description save and sort UMLGeneralization from UMLClassDiagram
 * @param {Array} mUMLGeneralization
 */
function setUMLGeneralization(mUMLGeneralization) {
    mUMLGeneralization.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLGeneralization", mUMLGeneralization);
    UMLGeneralization = mUMLGeneralization;
}
/**
 * @function getUMLGeneralization
 * @description returns array of UMLGeneralization from UMLClassDiagram
 * @returns {Array} UMLGeneralization
 */
function getUMLGeneralization() {
    return UMLGeneralization;
}
/**
 * @function setUMLInterfaceRealization
 * @description save and sort UMLInterfaceRealization from UMLClassDiagram
 * @param {Array} mUMLInterfaceRealization
 */
function setUMLInterfaceRealization(mUMLInterfaceRealization) {
    mUMLInterfaceRealization.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLInterfaceRealization", mUMLInterfaceRealization);
    UMLInterfaceRealization = mUMLInterfaceRealization;
}
/**
 * @function getUMLInterfaceRealization
 * @description returns array of UMLInterfaceRealization from UMLClassDiagram
 * @returns {Array} UMLInterfaceRealization
 */
function getUMLInterfaceRealization() {
    return UMLInterfaceRealization;
}
/**
 * @function setUMLEnumeration
 * @description save and sort UMLEnumeration from UMLClassDiagram
 * @param {Array} mUMLEnumeration
 */
function setUMLEnumeration(mUMLEnumeration) {
    mUMLEnumeration.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLEnumeration", mUMLEnumeration);
    UMLEnumeration = mUMLEnumeration;
}
/**
 * @function getUMLEnumeration
 * @description returns array of UMLEnumeration from UMLClassDiagram
 * @returns {Array} UMLEnumeration
 */
function getUMLEnumeration() {
    return UMLEnumeration
}
/**
 * @function setUMLAssociationClassLink
 * @description save and sort UMLAssociationClassLink from UMLClassDiagram
 * @param {Array} mUMLAssociationClassLink
 */
function setUMLAssociationClassLink(mUMLAssociationClassLink) {
    mUMLAssociationClassLink.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });
    console.log("UMLAssociationClassLink", mUMLAssociationClassLink);
    UMLAssociationClassLink = mUMLAssociationClassLink;
}
/**
 * @function getUMLAssociationClassLink
 * @description returns array of UMLAssociationClassLink from UMLClassDiagram
 * @returns {Array} UMLAssociationClassLink
 */
function getUMLAssociationClassLink() {
    return UMLAssociationClassLink;
}
/**
 * @function generateOpenAPI
 * @description generate OpenApi from UMLClassDiagram
 * @param {Object} mOpenApi
 * @returns {Promise} result
 */
function generateOpenAPI(mOpenApi) {
    return new Promise((resolve, reject) => {
        try {

            // let _this = this;
            /* TODO */
            mOpenApi.resetPackagePath();
            let srcRes = app.repository.search(openAPI.getUMLPackage().name);
            let fRes = srcRes.filter(function (item) {
                return (item instanceof type.UMLClassDiagram && item.name == openAPI.getUMLPackage().name);
            });
            let arrPath = null;
            let rPath = null;

            if (fRes.length == 1) {

                /* TODO  let */
                arrPath = openAPI.findHierarchy(fRes[0]._parent);
                /* TODO  let */
                rPath = openAPI.reversePkgPath(arrPath);
                /* TODO */
                openAPI.setPackagepath(rPath);
            }


            /*  Add openapi version */
            MainJSONDiagram.addApiVersion('3.0.0');
            console.log("-----version-generated");

            /* Add openapi information */
            let mInfo = new Info();
            MainJSONDiagram.addInfo(mInfo);
            console.log("-----info-generated");

            /* Add openapi servers */
            let server = new Servers();
            MainJSONDiagram.addServers(server);
            console.log("-----server-generated");

            /* Add openapi paths */
            let paths = new Paths();
            MainJSONDiagram.addPaths(paths);
            console.log("-----path-generated");

            /* Add openapi component */
            // let componentDiagram = new Component();
            let componentDiagram = new ComponentDiagram();
            MainJSONDiagram.addComponent(componentDiagram);
            console.log("-----component-generated-----");
            console.log(MainJSONDiagram.getJSON());
            let generator = new FileGenerator();
            generator.generate().then(function (fileGenerate) {
                console.log("-----file-generated-----");
                console.log("result-file-generated", fileGenerate);
                generator.validateAndPrompt().then(function (result) {
                    console.log("-----validate & prompt-----");
                    console.log("result-validate & prompt", result);
                    resolve(result);
                }).catch(function (err) {
                    reject(err);
                });

            }).catch(function (err) {
                reject(err);
            });

        } catch (error) {

            console.error("generateOpenAPI", error);
            utils.writeErrorToFile(error);
            reject(error);
        }
    });
}
/**
 * @function getDiagramElements
 * @description returns array of elements from UMLClassDiagram
 * @returns {Promise} result
 */
function getDiagramElements() {

    return new Promise((resolve, reject) => {
        let uniqueClassesArr = [];

        /* ------------ 1. UMLClass ------------ */
        let umlClasses = getUMLClass();

        /* ------------ 2. UMLInterface ------------ */
        let operations = getUMLInterface();

        /* ------------ 3. Association Class------------ */
        try {
            let tmpAsso = [];
            forEach(getUMLAssociation(), (child, index) => {
                if (child.end1.reference.name != child.end2.reference.name) {

                    let filter = umlClasses.filter(subItem => {
                        return child.end2.reference.name == subItem.name;
                    });

                    if (filter.length == 0) {
                        umlClasses.push(child.end2.reference);
                        tmpAsso.push(child.end2.reference);
                    }
                }

            });
            console.log("UMLAssociation", tmpAsso);

            /* ------------ 4. Generalization Class ------------ */

            let tmpGen = [];
            forEach(getUMLGeneralization(), (child, index) => {
                let filter = umlClasses.filter(subItem => {
                    return child.target.name == subItem.name;
                });
                if (filter.length == 0) {
                    umlClasses.push(child.target);
                    tmpGen.push(child.target.name);
                }
            });
            console.log("UMLGeneralization", tmpGen);

            /* ------------ 5. Filter unique classes ------------ */
            let resArr = [];
            forEach(umlClasses, (item, index) => {
                let filter = resArr.filter(subItem => {
                    return subItem._id == item._id;
                });
                if (filter.length == 0) {
                    resArr.push(item);
                }

            });
            console.log("Filter class done");

            /* ------------ 6. Sort unique classes ------------ */
            resArr.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            console.log("Sort class done");

            let uniqueArr = [];
            let duplicateClasses = [];
            let isDuplicate = false;


            forEach(resArr, function (item, index) {
                let filter = uniqueArr.filter(subItem => {
                    return item.name == subItem.name;
                });

                if (filter.length == 0) {
                    uniqueArr.push(item);
                } else {
                    isDuplicate = true;
                    duplicateClasses.push(item.name);
                    let firstElem = uniqueArr.indexOf(filter[0]);
                    uniqueArr[firstElem].attributes = uniqueArr[firstElem].attributes.concat(item.attributes);
                    uniqueArr[firstElem].ownedElements = uniqueArr[firstElem].ownedElements.concat(item.ownedElements);
                }
                uniqueClassesArr = uniqueArr;

            });


            if (!isDuplicate) {

                let mClasses = [];
                forEach(uniqueClassesArr, element => {
                    mClasses.push(element.name);
                });

                let mPaths = [];
                forEach(operations, element => {
                    mPaths.push(element.name);
                });
                console.log("Duplication filter done");
                console.log("Query Total Classes", mClasses);
                console.log("Query Total Interfaces", mPaths);
                resolve({
                    result: constant.FIELD_SUCCESS,
                    message: "model element generated"
                });
            } else {
                let message = null;
                if (duplicateClasses.length > 1) {
                    message = "There are duplicate \'" + duplicateClasses.join("\', \'") + "\'" + " classes for same name.";
                } else {
                    message = "There is duplicate \'" + duplicateClasses.join("\', \'") + "\'" + " class for same name.";
                }

                if (openAPI.getAppMode() == openAPI.APP_MODE_TEST && openAPI.getTestMode() == openAPI.TEST_MODE_ALL) {
                    let jsonError = {
                        isDuplicate: true,
                        msg: message
                    };
                    openAPI.setError(jsonError);
                }

                reject(new Error(message));

            }
        } catch (err) {
            reject(err)
        };
    });


}
/**
 * @function initUMLDiagram
 * @description initializes UML Package
 * @returns {Promise} result
 */
function initUMLDiagram() {
    return new Promise((resolve, reject) => {
        try {
            try {
                if (!fs.existsSync(openAPI.getFilePath())) {
                    fs.mkdirSync(openAPI.getFilePath());
                    resolve({
                        result: "success",
                        message: "Package initialize successfully"
                    })
                } else {
                    resolve({
                        result: "success",
                        message: "Package initialize successfully"
                    })
                }
            } catch (err) {
                console.error(err)
                reject(err);
            }

        } catch (_e) {
            console.error(_e);
            reject(_e);
            app.toast.error(constant.strerrorgenfail);
        }
    });

}
/**
 * @function removeIDFromOwnedElement
 * @description remove '_id' property from element to clone new element and returns array of new cloned elements
 * @param {*} UMLEle
 * @param {*} allDiagramElement
 * @returns {Array} tempOwnedElements
 */
function removeIDFromOwnedElement(UMLEle, allDiagramElement) {
    let tempOwnedElements = [];

    if(UMLEle.hasOwnProperty('ownedElements')){

        forEach(UMLEle.ownedElements, function (element) {
            let searchedEle = allDiagramElement.filter(function (mEle) {
                return element._id == mEle._id;
            });
            if (searchedEle.length != 0) {
                let mJsonRel = app.repository.writeObject(element);
                let mObjRel = JSON.parse(mJsonRel);
                delete mObjRel['_id'];
                tempOwnedElements.push(mObjRel);
            }
        });
    }
    return tempOwnedElements;
}
/**
 * @function removeIDFromAttribute
 * @description remove '_id' property from UMLAttribute to clone new UMLAttribute and returns array of new cloned UMLAttributes
 * @param {*} UMLEle
 * @returns {Array} tempAttributes
 */
function removeIDFromAttribute(UMLEle) {
    let tempAttributes = [];
    if(UMLEle.hasOwnProperty('attributes')){

        forEach(UMLEle.attributes, function (attrib) {
            
            let mJsonAttrib = app.repository.writeObject(attrib);
            let mObjAttrib = JSON.parse(mJsonAttrib);
            delete mObjAttrib['_id'];
            tempAttributes.push(mObjAttrib);
        });
    }
    return tempAttributes;
}
/**
 * @function removeIDFromOperation
 * @description remove '_id' property from UMLOperation to clone new UMLOperation and returns array of new cloned UMLOperations 
 * @param {*} UMLEle
 * @returns {Array} tempOperation
 */
function removeIDFromOperation(UMLEle) {
    let tempOperation = [];
    if(UMLEle.hasOwnProperty('operations')){

        forEach(UMLEle.operations, function (operation) {
            
            let mJsonOperation = app.repository.writeObject(operation);
            let mObjOperation = JSON.parse(mJsonOperation);
            delete mObjOperation['_id'];
            
            mObjOperation.parameters=removeIDFromParameter(operation);
            tempOperation.push(mObjOperation);
        });
    }
    return tempOperation;
}
/**
 * @function removeIDFromParameter
 * @description remove '_id' property from UMLParameter to clone new UMLParameter and returns array of new cloned UMLParameters 
 * @param {*} UMLEle
 * @returns {Array} tempParams
 */
function removeIDFromParameter(UMLOperation){
    let tempParams=[];
    if(UMLOperation.hasOwnProperty('parameters')){

        forEach(UMLOperation.parameters, function (params) {
            
            let mJsonParams = app.repository.writeObject(params);
            let mObjParams = JSON.parse(mJsonParams);
            delete mObjParams['_id'];
            tempParams.push(mObjParams);
        });
    }
    return tempParams;
}
/**
 * @function removeIDFromLiterals
 * @description remove '_id' property from UMLEnumerationLiteral to clone new UMLEnumerationLiteral and returns array of new cloned UMLEnumerationLiterals 
 * @param {*} UMLEle
 * @returns {Array} tempLiterals
 */
function removeIDFromLiterals(UMLEle) {
    let tempLiterals = [];
    if(UMLEle.hasOwnProperty('literals')){

        forEach(UMLEle.literals, function (literals) {
            
            let mJsonLiteral = app.repository.writeObject(literals);
            let mObjJsonLiteral = JSON.parse(mJsonLiteral);
            delete mObjJsonLiteral['_id'];
            tempLiterals.push(mObjJsonLiteral);
        });
    }
    return tempLiterals;
}
/**
 * @function filterUMLClassDiagram
 * @description filter class, interface, enumeration, association, generalization, interfacerealization, association class link views from UMLClassDiagram
 * @param {UMLClassDiagram} UMLClassDiagram
 * @returns {Array} allDiagramView
 */
function filterUMLClassDiagram(UMLClassDiagram){

    let classDiagram = UMLClassDiagram;

    /* Filter all diagram views */
    let allDiagramView = classDiagram.ownedViews.filter(function (view) {
        return view instanceof type.UMLClassView ||
             view instanceof type.UMLAssociationView ||
             view instanceof type.UMLInterfaceView ||
             view instanceof type.UMLInterfaceRealizationView ||
             view instanceof type.UMLGeneralizationView ||
             view instanceof type.UMLAssociationClassLinkView ||
             view instanceof type.UMLEnumerationView
   });

   /* Filter all model from view */
   let allDiagramElement = [];
   forEach(allDiagramView, function (dView) {
        allDiagramElement.push(dView.model);
   });
   setUMLDiagramElement(allDiagramElement);

   /* Filter UMLClass from model */
   let UMLClasses = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLClass
   });
   setUMLClass(UMLClasses);

   /* Filter UMLInterface from model */
   let UMLInterface = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLInterface
   });
   setUMLInterface(UMLInterface);

   /* Filter UMLAssociation from model */
   let UMLAssociation = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLAssociation
   });
   setUMLAssociation(UMLAssociation);

   /* Filter UMLGeneralization from model */
   let UMLGeneralization = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLGeneralization
   });
   setUMLGeneralization(UMLGeneralization);

   /* Filter UMLInterfaceRealization from model */
   let UMLInterfaceRealization = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLInterfaceRealization
   });
   setUMLInterfaceRealization(UMLInterfaceRealization);

   /* Filter UMLEnumeration from model */
   let UMLEnumeration = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLEnumeration
   });
   setUMLEnumeration(UMLEnumeration);

   /* Filter UMLAssociationClassLink from model */
   let UMLAssociationClassLink = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLAssociationClassLink
   });
   setUMLAssociationClassLink(UMLAssociationClassLink);

   /* Process package object of diagram */
   let mainOwnedElements = []
   let tempPackage = {
        'name': classDiagram.name,
        'ownedElements': mainOwnedElements,
        'documentation': classDiagram.documentation,
        '_type':'UMLPackage'
   };

   /* Process UMLClasses in package */
   forEach(UMLClasses, function (mClass) {
        
        let mJson=app.repository.writeObject(mClass);
        let mObj=JSON.parse(mJson);
        delete mObj['_id'];
        
        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mClass);

        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mClass);
        
        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mClass,allDiagramElement);
        
        mainOwnedElements.push(mObj);
   });

   /* Process UMLInterface in package */
   forEach(UMLInterface, function (mInterface) {

        let mJson=app.repository.writeObject(mInterface);
        let mObj=JSON.parse(mJson);
        delete mObj['_id'];

        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mInterface);

        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mInterface);

        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mInterface,allDiagramElement);
        
        mainOwnedElements.push(mObj);
   });

   /* Process UMLEnumeration in package */
   forEach(UMLEnumeration, function (mEnum) {
        let mJson=app.repository.writeObject(mEnum);
        let mObj=JSON.parse(mJson);
        delete mObj['_id'];
        
        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mEnum);
        
        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mEnum);
        
        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mEnum,allDiagramElement);
        
        /* Remove '_id' field from 'literals' array */
        mObj.literals = removeIDFromLiterals(mEnum);

        mainOwnedElements.push(mObj);

   });

   return tempPackage;
}
module.exports.filterUMLClassDiagram = filterUMLClassDiagram;
module.exports.removeIDFromLiterals = removeIDFromLiterals;
module.exports.removeIDFromOperation = removeIDFromOperation;
module.exports.removeIDFromAttribute = removeIDFromAttribute;
module.exports.removeIDFromOwnedElement = removeIDFromOwnedElement;
module.exports.setUMLClass = setUMLClass;
module.exports.getUMLClass = getUMLClass;
module.exports.setUMLInterface = setUMLInterface;
module.exports.getUMLInterface = getUMLInterface;
module.exports.setUMLAssociation = setUMLAssociation;
module.exports.getUMLAssociation = getUMLAssociation;
module.exports.setUMLGeneralization = setUMLGeneralization;
module.exports.getUMLGeneralization = getUMLGeneralization;
module.exports.setUMLInterfaceRealization = setUMLInterfaceRealization;
module.exports.getUMLInterfaceRealization = getUMLInterfaceRealization;
module.exports.setUMLEnumeration = setUMLEnumeration;
module.exports.getUMLEnumeration = getUMLEnumeration;
module.exports.setUMLAssociationClassLink = setUMLAssociationClassLink;
module.exports.getUMLAssociationClassLink = getUMLAssociationClassLink;
module.exports.setUMLDiagramElement = setUMLDiagramElement;
module.exports.getUMLDiagramElement = getUMLDiagramElement;
module.exports.initUMLDiagram = initUMLDiagram;
module.exports.getDiagramElements = getDiagramElements;
module.exports.generateOpenAPI = generateOpenAPI;