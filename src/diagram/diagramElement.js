var forEach = require('async-foreach').forEach;


let UMLClass = [];
let UMLInterface = [];
let UMLAssociation = [];
let UMLGeneralization = [];
let UMLInterfaceRealization = [];
let UMLEnumeration = [];
let UMLAssociationClassLink = [];
let AllElement = [];




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

    /* Add all visible diagram element */
    let allDiagramElement = [];
    forEach(allDiagramView, function (dView) {
        let model = dView.model;
        allDiagramElement.push(model);
    });
    setUMLDiagramElement(allDiagramElement);


    /* Filter UMLGeneralization from model */
    let UMLGeneralization = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLGeneralization
    });
    setUMLGeneralization(UMLGeneralization);

    /* Filter UMLAssociation from model */
    let UMLAssociation = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLAssociation
    });
    setUMLAssociation(UMLAssociation);


    /* Filter UMLInterfaceRealization from model */
    let UMLInterfaceRealization = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLInterfaceRealization
    });
    setUMLInterfaceRealization(UMLInterfaceRealization);


    /* Filter UMLAssociationClassLink from model */
    let UMLAssociationClassLink = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLAssociationClassLink
    });
    setUMLAssociationClassLink(UMLAssociationClassLink);



    /* Create new package of diagram */
    let tempPackage = {
        'name': 'tempPkg',
        'documentation': UMLClassDiagram.documentation,
        '_type': 'UMLPackage'
    };

    let newPkg = app.repository.readObject(tempPackage);
    let jsonPkgStr = app.repository.writeObject(newPkg);
    tempPackage = JSON.parse(jsonPkgStr);

    let mainOwnedElements = []
    tempPackage.ownedElements = mainOwnedElements;


    /* Create new elements from all diagram element */

    processDiagramElements(allDiagramElement, UMLClassDiagram, mainOwnedElements, tempPackage);
    newPkg = app.repository.readObject(tempPackage);
    tempPackage=processDiagramRelationship(newPkg);
    newPkg = app.repository.readObject(tempPackage);
    
    let newElements=newPkg.ownedElements;


    let newClasses = newElements.filter(function (item) {
        return item instanceof type.UMLClass;
    });
    let newInterfaces = newElements.filter(function (item) {
        return item instanceof type.UMLInterface;
    });
    let newEnumerations = newElements.filter(function (item) {
        return item instanceof type.UMLEnumeration;
    });

    jsonPkgStr = app.repository.writeObject(newPkg);
    tempPackage = JSON.parse(jsonPkgStr);


    console.log("newClasses", newClasses);
    setUMLClass(newClasses);
    console.log("newInterfaces", newInterfaces);
    setUMLInterface(newInterfaces);
    console.log("newEnumerations", newEnumerations);
    setUMLEnumeration(newEnumerations);

    /* Create new classes from all diagram element */
    /* processDiagramClasses(allDiagramElement, UMLClassDiagram, mainOwnedElements,tempPackage); */

    /* Create new interfaces from all diagram element */
    /* processDiagramInterfaces(allDiagramElement, UMLClassDiagram, mainOwnedElements,tempPackage); */

    /* Create new enumeration from all diagram element */
    /* processDiagramEnumerations(allDiagramElement, UMLClassDiagram, mainOwnedElements,tempPackage); */

    return tempPackage;
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
function removeIDFromOwnedElement(UMLEle, createdObj) {
    let tempOwnedElements = [];

    /* Filter generalization for current element (UMLClass, UMLInterface, UMLEnumeration) */
    let mGeneralization = getUMLGeneralization();
    let resGeneralization = mGeneralization.filter(function (item) {
        return UMLEle._id == item.source._id;
    });


    /* Filter association for current element (UMLClass, UMLInterface, UMLEnumeration) */
    let mAssociation = getUMLAssociation();
    let resAssociation = mAssociation.filter(function (item) {
        return UMLEle._id == item.end1.reference._id;
    });

    /* Filter interface realization for current element (UMLClass, UMLInterface, UMLEnumeration) */
    let mInterfaceRealization = getUMLInterfaceRealization();
    let resInterfaceRealization = mInterfaceRealization.filter(function (item) {
        return UMLEle._id == item.source._id;
    });

    /* Filter association class link for current element (UMLClass, UMLInterface, UMLEnumeration) */
    let mAssocClassLink = getUMLAssociationClassLink();
    let resAssocClassLink = mAssocClassLink.filter(function (item) {
        return UMLEle._id == item.associationSide.end1.reference._id;
    });

    /* Concat all filtered array of generalizatin, association, interface realization, association class link */
    let resFinal = resGeneralization.concat(resAssociation, resInterfaceRealization, resAssocClassLink);

    forEach(resFinal, function (item) {
        let mJson = app.repository.writeObject(item);
        let mObj = JSON.parse(mJson);
        delete mObj['_id'];
        delete mObj['tags'];
        if (mObj.hasOwnProperty('_parent')) {
            mObj._parent['$ref'] = createdObj._id;
        }
        if (item instanceof type.UMLGeneralization || item instanceof type.UMLInterfaceRealization) {
            /* Sample of UMLGeneralization & UMLInterfaceRealization  */
            /* {
                "_type": "UMLGeneralization || UMLInterfaceRealization",
                "_id": "AAAAAAFq3T8QNUoHGyc=",
                "_parent": {
                    "$ref": "AAAAAAFq3T6wbUAuRpg="
                },
                "source": {
                    "$ref": "AAAAAAFq3T6wbUAuRpg="
                },
                "target": {
                    "$ref": "cbf4dbe8-5a66-4904-9df7-131aad5188d9"
                }
            } */
            mObj.source['$ref'] = createdObj._id;
            
        } else if (item instanceof type.UMLAssociation) {
            /* Sample of UMLAssociation (Aggregation, Composition, Association) */
            /* {
                "_type": "UMLAssociation",
                "_id": "675e4375-80ec-4d98-9236-2cd086c57296",
                "name": "CertifyingTradeParty",
                "documentation": "A certifying party for this transport event.",
                "tags": [
                    {
                        "_type": "Tag",
                        "_id": "0d7bf904-a53a-4e1f-8106-7002e9d7d80a",
                        "_parent": {
                            "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                        },
                        "name": "UID",
                        "kind": "hidden",
                        "value": "UN01004810"
                    }
                ],
                "end1": {
                    "_type": "UMLAssociationEnd",
                    "_id": "23f1a23f-d75a-42b4-8e89-b8736cc6e22c",
                    "_parent": {
                        "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                    },
                    "reference": {
                        "$ref": "6748d1bb-e9c4-4965-9c41-80e9959e3b65"
                    },
                    "aggregation": "shared"
                },
                "end2": {
                    "_type": "UMLAssociationEnd",
                    "_id": "a0b5fdba-f18d-4ce8-af20-ee8e44b9ff20",
                    "_parent": {
                        "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                    },
                    "reference": {
                        "$ref": "1ac4d158-c7ac-4328-a561-e6f73aa1cc9b"
                    },
                    "multiplicity": "0..*"
                }
            } */
            mObj.end1.reference['$ref'] = createdObj._id;

        } else if (item instanceof type.UMLAssociationClassLink) {

            /* {
                "_type": "UMLAssociationClassLink",
                "_id": "AAAAAAFq4gfdu/f05+0=",
                "_parent": {
                    "$ref": "AAAAAAFq4gfduvfwBwA="
                },
                "classSide": {
                    "$ref": "AAAAAAFq4gfduvfwBwA="
                },
                "associationSide": {
                    "$ref": "AAAAAAFq4gfduvfx+cQ="
                }
            } */

            mObj.classSide['$ref'] = createdObj._id;
        }
        tempOwnedElements.push(mObj);

    });
    return tempOwnedElements;
}

function getViewFromElement(UMLEle, UMLClassDiagram) {
    let allCView = [];

    /* Get view of UMLClass, UMLInterface, UMLEnumeration from UMLEle of type */
    if (UMLEle instanceof type.UMLClass) {
        allCView = app.repository.select(UMLClassDiagram.name + '::@UMLClassView');
    } else if (UMLEle instanceof type.UMLInterface) {
        allCView = app.repository.select(UMLClassDiagram.name + '::@UMLInterfaceView');
    } else if (UMLEle instanceof type.UMLEnumeration) {
        allCView = app.repository.select(UMLClassDiagram.name + '::@UMLEnumerationView');
    }
    /* Get view current UMLEle element */
    let resAllCView = allCView.filter(function (item) {
        return UMLEle._id == item.model._id;
    });

    return resAllCView;
}
/**
 * @function removeIDFromAttribute
 * @description remove '_id' property from UMLAttribute to clone new UMLAttribute and returns array of new cloned UMLAttributes
 * @param {*} UMLEle
 * @returns {Array} tempAttributes
 */
function removeIDFromAttribute(UMLEle, UMLClassDiagram, createdObj) {
    let tempAttributes = [];


    /* Get all attribute view from current element view from attributeCompartment of current element view  */
    let resAllCView = getViewFromElement(UMLEle, UMLClassDiagram);
    if (resAllCView.length == 1) {

        /* Filter visible attribute from attributeCompartment */
        let subAttributeViews = resAllCView[0].attributeCompartment.subViews
        let resultAttrView = subAttributeViews.filter(function (itemAttrView) {
            return itemAttrView.visible
        });
        let resAttribute = [];
        forEach(resultAttrView, function (item) {
            resAttribute.push(item.model);
        });

        /* Create array of all new created attribute and return it for current element  */
        forEach(resAttribute, function (attrib) {
            /* Sample object of UMLAttribute */
            /* {
                "_type": "UMLAttribute",
                "_id": "AAAAAAFq4t7r3l9th1Y=",
                "_parent": {
                    "$ref": "AAAAAAFq4t5gzls/lo8="
                },
                "name": "Role",
                "type": "TransportMeansPartyRole_Code"
            } */
            let newEnum = null;
            let mJsonAttrib = app.repository.writeObject(attrib);
            let mObjAttrib = JSON.parse(mJsonAttrib);
            delete mObjAttrib['_id'];
            delete mObjAttrib['tags'];
            mObjAttrib._parent['$ref'] = createdObj._id;

            //TODO Do not remove this code : This is for invisible enumeration code
            /* created temp Enumeration for attrib.type if is Reference of any Enumeration */
            if (attrib.type instanceof type.UMLEnumeration) {
                let enumView = app.repository.select(UMLClassDiagram.name + '::@UMLEnumerationView');
                let resEnumView = enumView.filter(function (item) {
                    return item.model._id == attrib.type._id;
                });
                if (resEnumView.length == 1) {
                    let subLiteralViews = resEnumView[0].enumerationLiteralCompartment.subViews
                    let resultLiteralView = subLiteralViews.filter(function (itemLiteralView) {
                        return itemLiteralView.visible
                    });
                    let resLiteral = [];
                    forEach(resultLiteralView, function (item) {
                        let tmp = app.repository.writeObject(item.model);
                        let tmpObj = JSON.parse(tmp);
                        delete tmpObj['_id'];
                        resLiteral.push(tmpObj);
                    });
                    let stringEnum = app.repository.writeObject(attrib.type)
                    let tempNewEnum = JSON.parse(stringEnum);

                    delete tempNewEnum['_id'];

                    tempNewEnum.literals = resLiteral;

                    newEnum = app.repository.readObject(tempNewEnum);
                    mObjAttrib.type = {
                        '$ref': newEnum._id
                    };
                    addNewCreatedElement(newEnum);

                }
            }

            
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
function removeIDFromOperation(UMLEle, UMLClassDiagram, createdObj) {
    let tempOperation = [];

    /* Get all attribute view from current element view from operationCompartment of current element view  */
    let resAllCView = getViewFromElement(UMLEle, UMLClassDiagram);

    if (resAllCView.length == 1) {

        /* Filter visible attribute from operationCompartment */
        let subOperationViews = resAllCView[0].operationCompartment.subViews
        let resultOperationView = subOperationViews.filter(function (itemOperationView) {
            return itemOperationView.visible
        });
        let resOperation = [];
        forEach(resultOperationView, function (item) {
            resOperation.push(item.model);
        });

        /* Create array of all new created operation and return it for current element  */
        forEach(resOperation, function (operation) {

            /* {
                "_type": "UMLOperation",
                "_id": "AAAAAAFq5GEpE/hHZTU=",
                "_parent": {
                    "$ref": "AAAAAAFq5F2ToO3D8Xw="
                },
                "name": "POST",
                "parameters": []
            } */


            let mJsonOperation = app.repository.writeObject(operation);
            let mObjOperation = JSON.parse(mJsonOperation);
            delete mObjOperation['_id'];
            delete mObjOperation['tags'];
            delete mObjOperation['parameters'];
            mObjOperation._parent['$ref'] = createdObj._id;

            let newOperation = app.repository.readObject(mObjOperation);
            mJsonOperation = app.repository.writeObject(newOperation);
            mObjOperation = JSON.parse(mJsonOperation);

            mObjOperation.parameters = removeIDFromParameter(operation, mObjOperation);
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
function removeIDFromParameter(UMLOperation, mObjOperation) {
    let tempParams = [];
    if (UMLOperation.hasOwnProperty('parameters')) {

        forEach(UMLOperation.parameters, function (params) {

            /* {
                "_type": "UMLParameter",
                "_id": "AAAAAAFq5GGAdfjzrdQ=",
                "_parent": {
                    "$ref": "AAAAAAFq5GEpE/hHZTU="
                },
                "name": "TransportEvent",
                "type": ""
            } */

            let mJsonParams = app.repository.writeObject(params);
            let mObjParams = JSON.parse(mJsonParams);
            delete mObjParams['_id'];
            delete mObjParams['tags'];
            // mObjParams._parent['$ref']=mObjOperation._id;
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
function removeIDFromLiterals(UMLEle, UMLClassDiagram, createdObj) {
    let tempLiterals = [];

    /* Get all attribute view from current element view from enumerationLiteralCompartment of current element view  */
    let resAllCView = getViewFromElement(UMLEle, UMLClassDiagram);

    if (resAllCView.length == 1) {

        let subLiteralViews = resAllCView[0].enumerationLiteralCompartment.subViews
        let resultLiteralView = subLiteralViews.filter(function (itemLiteralView) {
            return itemLiteralView.visible
        });
        let resLiteral = [];
        forEach(resultLiteralView, function (item) {
            resLiteral.push(item.model);
        });

        forEach(resLiteral, function (attrib) {

            let mJsonLiteral = app.repository.writeObject(attrib);
            let mObjLiteral = JSON.parse(mJsonLiteral);
            delete mObjLiteral['_id'];
            delete mObjLiteral['tags'];
            mObjLiteral._parent['$ref'] = createdObj._id;

            /* remove ID from Tags from literal */
            /*
            let tags = mObjLiteral.tags;
             if (tags != null && tags.length > 0) {

                let tempTags = [];
                forEach(tags, function (tag) {
                    delete tag['_id'];
                    tempTags.push(tag);
                });
                mObjLiteral.tags = tempTags;
            } */

            tempLiterals.push(mObjLiteral);
        });
    }
    return tempLiterals;
}


function processDiagramElements(allDiagramElement, UMLClassDiagram, mainOwnedElements, tempPackage) {
    /* Filter UMLClass from model */
    let UMLElements = allDiagramElement.filter(function (dElement) {
        return dElement instanceof type.UMLClass || dElement instanceof type.UMLInterface || dElement instanceof type.UMLEnumeration
    });
    // let newElements = [];
    /* Process All UMLElements in package */
    forEach(UMLElements, function (tElement) {
        let mElement=tElement;
        if (mElement instanceof type.UMLClass || mElement instanceof type.UMLInterface || mElement instanceof type.UMLEnumeration) {

            let mJson = app.repository.writeObject(mElement);
            let mObj = JSON.parse(mJson);
            delete mObj['_id'];
            delete mObj['tags'];
            delete mObj['attributes'];
            delete mObj['operations'];
            delete mObj['literals'];
            

            mObj._parent['$ref'] = tempPackage._id;

            let created = app.repository.readObject(mObj);
            mJson = app.repository.writeObject(created);
            mObj = JSON.parse(mJson);

            /* Remove '_id' field from UMLAttribute */
            mObj.attributes = removeIDFromAttribute(mElement, UMLClassDiagram, mObj);

            /* Remove '_id' field from UMLOperation */
            mObj.operations = removeIDFromOperation(mElement, UMLClassDiagram, mObj);

            /* Remove '_id' field from UMLEnumerationLiterals array */
            if (mElement instanceof type.UMLEnumeration) {
                mObj.literals = removeIDFromLiterals(mElement, UMLClassDiagram, mObj);
            }

            /* Remove '_id' field from Elements available in 'ownedElements' array */
            mObj.ownedElements = removeIDFromOwnedElement(mElement, mObj);

            created = app.repository.readObject(mObj);
            mJson = app.repository.writeObject(created);
            mObj = JSON.parse(mJson);
            mainOwnedElements.push(mObj);

            // newElements.push(created);

        }
    });
    // return newElements;
}

function processDiagramRelationship(tempPackage) {
    let tmpNewPkgStr=app.repository.writeObject(tempPackage);
    let tmpNewPkg=JSON.parse(tmpNewPkgStr);
    let elementsArr=[];
    tmpNewPkg.ownedElements=elementsArr;

    forEach(tempPackage.ownedElements, function (newElement) {
        /* Element (Class,Interface,Enumeration) */
        let tmpNewElementJSONStr=app.repository.writeObject(newElement);
        let tmpNewElement=JSON.parse(tmpNewElementJSONStr);
        let newOwnedElements=[];
        tmpNewElement.ownedElements=newOwnedElements;

        forEach(newElement.ownedElements, function (item) {
            /* Relationship (Association, Generalization, InterfaceRealization, AssociationClassLink) */
            let mJson = app.repository.writeObject(item);
            let mObj = JSON.parse(mJson);
            if (item instanceof type.UMLGeneralization || item instanceof type.UMLInterfaceRealization) {
                /* {
                    "_type": "UMLGeneralization || UMLInterfaceRealization",
                    "_id": "AAAAAAFq3T8QNUoHGyc=",
                    "_parent": {
                        "$ref": "AAAAAAFq3T6wbUAuRpg="
                    },
                    "source": {
                        "$ref": "AAAAAAFq3T6wbUAuRpg="
                    },
                    "target": {
                        "$ref": "cbf4dbe8-5a66-4904-9df7-131aad5188d9"
                    }
                } */
                
                let resTarget = app.repository.select(tempPackage.name + "::" + item.target.name);
                if (resTarget.length == 1) {
                    mObj.target['$ref'] = resTarget[0]._id;
                }

            } else if (item instanceof type.UMLAssociation) {

                /* {
                    "_type": "UMLAssociation",
                    "_id": "675e4375-80ec-4d98-9236-2cd086c57296",
                    "name": "CertifyingTradeParty",
                    "documentation": "A certifying party for this transport event.",
                    "tags": [
                        {
                            "_type": "Tag",
                            "_id": "0d7bf904-a53a-4e1f-8106-7002e9d7d80a",
                            "_parent": {
                                "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                            },
                            "name": "UID",
                            "kind": "hidden",
                            "value": "UN01004810"
                        }
                    ],
                    "end1": {
                        "_type": "UMLAssociationEnd",
                        "_id": "23f1a23f-d75a-42b4-8e89-b8736cc6e22c",
                        "_parent": {
                            "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                        },
                        "reference": {
                            "$ref": "6748d1bb-e9c4-4965-9c41-80e9959e3b65"
                        },
                        "aggregation": "shared"
                    },
                    "end2": {
                        "_type": "UMLAssociationEnd",
                        "_id": "a0b5fdba-f18d-4ce8-af20-ee8e44b9ff20",
                        "_parent": {
                            "$ref": "675e4375-80ec-4d98-9236-2cd086c57296"
                        },
                        "reference": {
                            "$ref": "1ac4d158-c7ac-4328-a561-e6f73aa1cc9b"
                        },
                        "multiplicity": "0..*"
                    }
                } */

                let resTarget = app.repository.select(tempPackage.name + "::" + item.end2.reference.name);
                if (resTarget.length == 1) {
                    mObj.end2.reference['$ref'] = resTarget[0]._id;
                }

            } else if (item instanceof type.UMLAssociationClassLink) {

                /* {
                    "_type": "UMLAssociationClassLink",
                    "_id": "AAAAAAFq4gfdu/f05+0=",
                    "_parent": {
                        "$ref": "AAAAAAFq4gfduvfwBwA="
                    },
                    "classSide": {
                        "$ref": "AAAAAAFq4gfduvfwBwA="
                    },
                    "associationSide": {
                        "$ref": "AAAAAAFq4gfduvfx+cQ="
                    }
                } */

            }
            
            newOwnedElements.push(mObj);
        });
        elementsArr.push(tmpNewElement);
    });
    return tmpNewPkg;
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
let newCreatedElementsArr = [];

function getNewCreatedElements() {
    return newCreatedElementsArr;
}

function addNewCreatedElement(element) {
    newCreatedElementsArr.push(element);
}

function deleteNewCreatedElement() {

    let eleList = getNewCreatedElements();
    forEach(eleList, function (element) {
        removeDiagram(element);
    });
}

function createPackage(mPackage) {
    let mNewDiagram = app.repository.readObject(mPackage);

    console.log("---111---old---UMLGeneralization", getUMLGeneralization());
    console.log("---111---old---UMLAssociation", getUMLAssociation());
    console.log("---111---old---UMLInterfaceRealization", getUMLInterfaceRealization());
    console.log("---111---old---UMLAssociationClassLink", getUMLAssociationClassLink());

    UMLGeneralization = [];
    UMLAssociation = [];
    UMLInterfaceRealization = [];
    UMLAssociationClassLink = [];
    /* filter all Association, Generalization, InterfaceRealizatin, AssociationClassLink */
    forEach(mNewDiagram.ownedElements, function (element) {
        forEach(element.ownedElements, function (ownedEle) {
            if (ownedEle instanceof type.UMLGeneralization) {
                let res = UMLGeneralization.filter(function (item) {
                    return item._id == ownedEle._id;
                });
                if (res.length == 0) {
                    UMLGeneralization.push(ownedEle);
                }
            } else if (ownedEle instanceof type.UMLAssociation) {
                let res = UMLAssociation.filter(function (item) {
                    return item._id == ownedEle._id;
                });
                if (res.length == 0) {
                    UMLAssociation.push(ownedEle);
                }
            } else if (ownedEle instanceof type.UMLInterfaceRealization) {
                let res = UMLInterfaceRealization.filter(function (item) {
                    return item._id == ownedEle._id;
                });
                if (res.length == 0) {
                    UMLInterfaceRealization.push(ownedEle);
                }
            } else if (ownedEle instanceof type.UMLAssociationClassLink) {
                let res = UMLAssociationClassLink.filter(function (item) {
                    return item._id == ownedEle._id;
                });
                if (res.length == 0) {
                    UMLAssociationClassLink.push(ownedEle);
                }
            }
        });
    });

    console.log("---111---new---UMLGeneralization", getUMLGeneralization());
    console.log("---111---new---UMLAssociation", getUMLAssociation());
    console.log("---111---new---UMLInterfaceRealization", getUMLInterfaceRealization());
    console.log("---111---new---UMLAssociationClassLink", getUMLAssociationClassLink());
    return mNewDiagram;
}
module.exports.createPackage = createPackage;
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
module.exports.deleteNewCreatedElement = deleteNewCreatedElement;