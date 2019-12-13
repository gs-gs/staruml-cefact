var forEach = require('async-foreach').forEach;


let UMLClass = null;
let UMLInterface = null;
let UMLAssociation = null;
let UMLGeneralization = null;
let UMLInterfaceRealization = null;
let UMLEnumeration = null;
let UMLAssociationClassLink = null;
let AllElement = null;

function processVisibleAttributeViews(mAllElement) {
    forEach(mAllElement, function (element) {
        if (element instanceof type.UMLClass || element instanceof type.UMLInterface) {
            console.log("----view-checking----Class", element.name);
            let newAttributes = [];
            forEach(element.attributes, function (attrib) {
                console.log("----view-checking----attr-", attrib);
                let ArrUMLAttributeView = app.repository.getViewsOf(attrib);
                if (ArrUMLAttributeView.length >= 1) {

                    let resAttr = ArrUMLAttributeView.filter(function (item) {
                        return item.model._id == attrib._id;
                    });
                    console.log("----view-checking----attr-views", resAttr);
                    if (resAttr.length > 0) {

                        let UMLAttributeView = resAttr[0];
                        if (UMLAttributeView.visible) {
                            newAttributes.push(attrib);
                        }
                    }
                }
            });
            element.attributes = newAttributes;
        }
    });
}

function processVisibleLiteralViews(mAllElement) {
    forEach(mAllElement, function (element) {
        if (element instanceof type.UMLEnumeration) {
            console.log("----view-checking----Enumeration", element.name);
            let newLiterals = [];
            forEach(element.literals, function (mEnum) {
                console.log("----view-checking----mEnum-", mEnum);
                let ArrUMLEnumerationView = app.repository.getViewsOf(mEnum);
                if (ArrUMLEnumerationView.length >= 1) {

                    let resAttr = ArrUMLEnumerationView.filter(function (item) {
                        return item.model._id == mEnum._id;
                    });
                    console.log("----view-checking----mEnum-views", resAttr);
                    if (resAttr.length > 0) {

                        let UMLEnumerationView = resAttr[0];
                        if (UMLEnumerationView.visible) {
                            newLiterals.push(mEnum);
                        }
                    }
                }
            });
            element.literals = newLiterals;
        }
    });
}

function processVisibleOperationViews(mAllElement) {
    forEach(mAllElement, function (element) {
        if (element instanceof type.UMLInterface) {
            console.log("----view-checking----Interface", element.name);
            let newOperations = [];
            forEach(element.operations, function (mOperation) {
                console.log("----view-checking----mOperation-", mOperation);
                let ArrUMLOperationView = app.repository.getViewsOf(mOperation);
                if (ArrUMLOperationView.length >= 1) {

                    let resAttr = ArrUMLOperationView.filter(function (item) {
                        return item.model._id == mOperation._id;
                    });
                    console.log("----view-checking----mOperation-views", resAttr);
                    if (resAttr.length > 0) {

                        let UMLOperationView = resAttr[0];
                        if (UMLOperationView.visible) {
                            newOperations.push(mOperation);
                        }
                    }
                }
            });
            element.operations = newOperations;
        }
    });
}
/**
 * @function setUMLDiagramElement
 * @description save & sort all element from UMLClassDiagram 
 * @param {Array} mAllElement
 */
function setUMLDiagramElement(mAllElement) {
    mAllElement.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    /* Filter for visible attribute Views from diagram elements (Class & Interface) */
    //processVisibleAttributeViews(mAllElement);

    /* Filter for visible literal Views from diagram elements (Enumeration) */
    // processVisibleLiteralViews(mAllElement);

    /* Filter for visible operation Views from diagram elements (Interface) */
    // processVisibleOperationViews(mAllElement);

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
 * @function removeIDFromOwnedElement
 * @description remove '_id' property from element to clone new element and returns array of new cloned elements
 * @param {*} UMLEle
 * @param {*} allDiagramElement
 * @returns {Array} tempOwnedElements
 */
function removeIDFromOwnedElement(UMLEle, allDiagramElement) {
    let tempOwnedElements = [];

    if (UMLEle.hasOwnProperty('ownedElements')) {

        forEach(UMLEle.ownedElements, function (element) {
            let searchedEle = allDiagramElement.filter(function (mEle) {
                return element._id == mEle._id;
            });
            if (searchedEle.length != 0) {
                let mJsonRel = app.repository.writeObject(element);
                let mObjRel = JSON.parse(mJsonRel);
                delete mObjRel['_id'];
                if (element instanceof type.UMLAssociation) {
                    let end1, end2;
                    end1 = app.repository.writeObject(element.end1);
                    end1 = JSON.parse(end1);
                    delete end1['_id'];
                    end1 = app.repository.readObject(end1);
                    end1 = app.repository.writeObject(end1);
                    end1 = JSON.parse(end1);

                    end2 = app.repository.writeObject(element.end2);
                    end2 = JSON.parse(end2);
                    delete end2['_id'];
                    end2 = app.repository.readObject(end2);
                    end2 = app.repository.writeObject(end2);
                    end2 = JSON.parse(end2);

                    mObjRel.end1 = end1;
                    mObjRel.end2 = end2;
                }
                tempOwnedElements.push(mObjRel);
            }
        });
    }
    return tempOwnedElements;
}

function getViewOf(element) {
    let ViewOfElement = app.repository.getViewsOf(element);

    let ArrUMLAttributeView = app.repository.getViewsOf(attrib);

    if (ArrUMLAttributeView.length === 1) {
        let UMLAttributeView = ArrUMLAttributeView[0];
        if (UMLAttributeView.visible) {

            let mJsonAttrib = app.repository.writeObject(attrib);
            let mObjAttrib = JSON.parse(mJsonAttrib);
            delete mObjAttrib['_id'];
            // delete mObjAttrib['tags'];
            tempAttributes.push(mObjAttrib);
        }
    }
}
/**
 * @function removeIDFromAttribute
 * @description remove '_id' property from UMLAttribute to clone new UMLAttribute and returns array of new cloned UMLAttributes
 * @param {*} UMLEle
 * @returns {Array} tempAttributes
 */
function removeIDFromAttribute(UMLEle) {
    let tempAttributes = [];
    if (UMLEle.hasOwnProperty('attributes')) {

        forEach(UMLEle.attributes, function (attrib) {

            let mJsonAttrib = app.repository.writeObject(attrib);
            let mObjAttrib = JSON.parse(mJsonAttrib);
            delete mObjAttrib['_id'];
            // delete mObjAttrib['tags'];
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
    if (UMLEle.hasOwnProperty('operations')) {

        forEach(UMLEle.operations, function (operation) {

            let mJsonOperation = app.repository.writeObject(operation);
            let mObjOperation = JSON.parse(mJsonOperation);
            delete mObjOperation['_id'];

            mObjOperation.parameters = removeIDFromParameter(operation);
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
function removeIDFromParameter(UMLOperation) {
    let tempParams = [];
    if (UMLOperation.hasOwnProperty('parameters')) {

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
    if (UMLEle.hasOwnProperty('literals')) {

        forEach(UMLEle.literals, function (literals) {

            let mJsonLiteral = app.repository.writeObject(literals);
            let mObjJsonLiteral = JSON.parse(mJsonLiteral);
            delete mObjJsonLiteral['_id'];

            let tags = mObjJsonLiteral.tags;
            /* remove ID from Tags from literal */
            if (tags != null && tags.length > 0) {

                let tempTags = [];
                forEach(tags, function (tag) {
                    delete tag['_id'];
                    tempTags.push(tag);
                });
                mObjJsonLiteral.tags = tempTags;
            }
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
function filterUMLClassDiagram(UMLClassDiagram) {

    /* Filter all diagram views */
    let allDiagramView = UMLClassDiagram.ownedViews.filter(function (view) {
        return (view instanceof type.UMLClassView ||
                view instanceof type.UMLAssociationView ||
                view instanceof type.UMLInterfaceView ||
                view instanceof type.UMLInterfaceRealizationView ||
                view instanceof type.UMLGeneralizationView ||
                view instanceof type.UMLAssociationClassLinkView ||
                view instanceof type.UMLEnumerationView) &&
            view.visible
    });

    let allDiagramElement = [];
    forEach(allDiagramView, function (dView) {
        let model=dView.model;
        allDiagramElement.push(model);
    });

    console.log("------DElement", allDiagramElement);
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
        'name': 'tempPkg',
        'ownedElements': mainOwnedElements,
        'documentation': UMLClassDiagram.documentation,
        '_type': 'UMLPackage'
    };

    /* Process UMLClasses in package */
    forEach(UMLClasses, function (mClass) {

        let mJson = app.repository.writeObject(mClass);
        let mObj = JSON.parse(mJson);
        delete mObj['_id'];

        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mClass);

        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mClass);

        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mClass, allDiagramElement);

        mainOwnedElements.push(mObj);
    });

    /* Process UMLInterface in package */
    forEach(UMLInterface, function (mInterface) {

        let mJson = app.repository.writeObject(mInterface);
        let mObj = JSON.parse(mJson);
        delete mObj['_id'];

        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mInterface);

        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mInterface);

        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mInterface, allDiagramElement);

        mainOwnedElements.push(mObj);
    });

    /* Process UMLEnumeration in package */
    forEach(UMLEnumeration, function (mEnum) {
        let mJson = app.repository.writeObject(mEnum);
        let mObj = JSON.parse(mJson);
        delete mObj['_id'];

        /* Remove '_id' field from UMLAttribute */
        mObj.attributes = removeIDFromAttribute(mEnum);

        /* Remove '_id' field from UMLOperation */
        mObj.operations = removeIDFromOperation(mEnum);

        /* Remove '_id' field from Elements available in 'ownedElements' array */
        mObj.ownedElements = removeIDFromOwnedElement(mEnum, allDiagramElement);

        /* Remove '_id' field from 'literals' array */
        mObj.literals = removeIDFromLiterals(mEnum);

        mainOwnedElements.push(mObj);

    });

    return tempPackage;
}

/**
 * @function removeDiagram
 * @description delete package from staruml after openapi is generated from diagram
 * @param {UMLPackage} tempPackage
 */
function removeDiagram(tempPackage) {
    let operationBuilder = app.repository.getOperationBuilder()
    operationBuilder.begin('remove item')
    operationBuilder.remove(tempPackage);
    operationBuilder.end();
    var cmd = operationBuilder.getOperation()
    app.repository.doOperation(cmd)
    console.log("deleted package", tempPackage);
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
module.exports.removeDiagram = removeDiagram;