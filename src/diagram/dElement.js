let UMLClassView = [];
let UMLInterfaceView = [];
let UMLAssociationView = [];
let UMLGeneralizationView = [];
let UMLInterfaceRealizationView = [];
let UMLEnumerationView = [];
let UMLAssociationClassLinkView = [];

/**
 * @function filterUMLClassDiagram
 * @description filter class, interface, enumeration, association, generalization, interfacerealization, association class link views from UMLClassDiagram
 * @param {UMLClassDiagram} UMLClassDiagram
 * @returns {Array} allView
 */
function filterUMLClassDiagram(UMLClassDiagram) {

    /* Filter all diagram views */
    let allView = UMLClassDiagram.ownedViews.filter(function (view) {
        return (view instanceof type.UMLClassView ||
                view instanceof type.UMLAssociationView ||
                view instanceof type.UMLInterfaceView ||
                view instanceof type.UMLInterfaceRealizationView ||
                view instanceof type.UMLGeneralizationView ||
                view instanceof type.UMLAssociationClassLinkView ||
                view instanceof type.UMLEnumerationView) &&
            view.visible
    });

    /* Filter all UMLClassView from selected UMLClassDiagram */
    let UMLClassView = allView.filter(function (item) {
        return item instanceof type.UMLClassView;
    });
    setUMLClassView(UMLClassView);

    /* Filter all UMLInterfaceView from selected UMLClassDiagram */
    let UMLInterfaceView = allView.filter(function (item) {
        return item instanceof type.UMLInterfaceView;
    });
    setUMLInterfaceView(UMLInterfaceView);

    /* Filter all UMLEnumerationView from selected UMLClassDiagram */
    let UMLEnumerationView = allView.filter(function (item) {
        return item instanceof type.UMLEnumerationView;
    });
    setUMLEnumerationView(UMLEnumerationView);


    /* Filter UMLGeneralizationView from model */
    let UMLGeneralizationView = allView.filter(function (dElement) {
        return dElement instanceof type.UMLGeneralizationView
    });
    setUMLGeneralizationView(UMLGeneralizationView);

    /* Filter UMLAssociationView from model */
    let UMLAssociationView = allView.filter(function (dElement) {
        return dElement instanceof type.UMLAssociationView
    });
    setUMLAssociationView(UMLAssociationView);

    /* Filter UMLInterfaceRealizationView from model */
    let UMLInterfaceRealizationView = allView.filter(function (dElement) {
        return dElement instanceof type.UMLInterfaceRealizationView
    });
    setUMLInterfaceRealizationView(UMLInterfaceRealizationView);


    /* Filter UMLAssociationClassLinkView from model */
    let UMLAssociationClassLinkView = allView.filter(function (dElement) {
        return dElement instanceof type.UMLAssociationClassLinkView
    });
    setUMLAssociationClassLinkView(UMLAssociationClassLinkView);

}

/**
 * @function setUMLClassView
 * @description save UMLClassView from UMLClassDiagram
 * @param {Array} mUMLClass
 */
function setUMLClassView(mUMLClass) {
    mUMLClass.sort(function (a, b) {
        return a.model.name.localeCompare(b.model.name);
    });
    UMLClassView = mUMLClass
}

/**
 * @function getUMLClassView
 * @description retuns the Array of UMLClassView from UMLClassDiagra
 * @returns {Array} UMLClassView
 */
function getUMLClassView() {
    return UMLClassView;
}

/**
 * @function setUMLInterfaceView
 * @description save array of UMLInterfaceView from UMLClassDiagram
 * @param {Array} mUMLInterface
 */
function setUMLInterfaceView(mUMLInterface) {
    UMLInterfaceView = mUMLInterface;
}

/**
 * @function getUMLInterfaceView
 * @description returns array of UMLInterfaceView from UMLClassDiagram
 * @returns {Array} UMLInterfaceView
 */
function getUMLInterfaceView() {
    return UMLInterfaceView;
}

/**
 * @function setUMLAssociationView
 * @description save and sort UMLAssociationView from UMLClassDiagram
 * @param {Array} mUMLAssociation
 */
function setUMLAssociationView(mUMLAssociationView) {

    UMLAssociationView = mUMLAssociationView;
}

/**
 * @function getUMLAssociationView
 * @description returns array of UMLAssociationView from UMLClassDiagram
 * @returns {Array} UMLAssociationView
 */
function getUMLAssociationView() {
    return UMLAssociationView;
}

/**
 * @function setUMLGeneralizationView
 * @description save and sort UMLGeneralizationView from UMLClassDiagram
 * @param {Array} mUMLGeneralization
 */
function setUMLGeneralizationView(mUMLGeneralizationView) {
    UMLGeneralizationView = mUMLGeneralizationView;
}

/**
 * @function getUMLGeneralizationView
 * @description returns array of UMLGeneralizationView from UMLClassDiagram
 * @returns {Array} UMLGeneralizationView
 */
function getUMLGeneralizationView() {
    return UMLGeneralizationView;
}

/**
 * @function setUMLInterfaceRealizationView
 * @description save and sort UMLInterfaceRealizationView from UMLClassDiagram
 * @param {Array} mUMLInterfaceRealization
 */
function setUMLInterfaceRealizationView(mUMLInterfaceRealization) {
    UMLInterfaceRealizationView = mUMLInterfaceRealization;
}

/**
 * @function getUMLInterfaceRealizationView
 * @description returns array of UMLInterfaceRealizationView from UMLClassDiagram
 * @returns {Array} UMLInterfaceRealizationView
 */
function getUMLInterfaceRealizationView() {
    return UMLInterfaceRealizationView;
}

/**
 * @function setUMLEnumerationView
 * @description save and sort UMLEnumerationView from UMLClassDiagram
 * @param {Array} mUMLEnumeration
 */
function setUMLEnumerationView(mUMLEnumeration) {
    UMLEnumerationView = mUMLEnumeration;
}

/**
 * @function getUMLEnumerationView
 * @description returns array of UMLEnumerationView from UMLClassDiagram
 * @returns {Array} UMLEnumerationView
 */
function getUMLEnumerationView() {
    return UMLEnumerationView
}

/**
 * @function setUMLAssociationClassLinkView
 * @description save and sort UMLAssociationClassLinkView from UMLClassDiagram
 * @param {Array} mUMLAssociationClassLink
 */
function setUMLAssociationClassLinkView(mUMLAssociationClassLink) {
    UMLAssociationClassLinkView = mUMLAssociationClassLink;
}

/**
 * @function getUMLAssociationClassLinkView
 * @description returns array of UMLAssociationClassLinkView from UMLClassDiagram
 * @returns {Array} UMLAssociationClassLinkView
 */
function getUMLAssociationClassLinkView() {
    return UMLAssociationClassLinkView;
}


module.exports.filterUMLClassDiagram = filterUMLClassDiagram;
module.exports.setUMLClassView = setUMLClassView;
module.exports.getUMLClassView = getUMLClassView;
module.exports.setUMLInterfaceView = setUMLInterfaceView;
module.exports.getUMLInterfaceView = getUMLInterfaceView;
module.exports.setUMLAssociationView = setUMLAssociationView;
module.exports.getUMLAssociationView = getUMLAssociationView;
module.exports.setUMLGeneralizationView = setUMLGeneralizationView;
module.exports.getUMLGeneralizationView = getUMLGeneralizationView;
module.exports.setUMLInterfaceRealizationView = setUMLInterfaceRealizationView;
module.exports.getUMLInterfaceRealizationView = getUMLInterfaceRealizationView;
module.exports.setUMLEnumerationView = setUMLEnumerationView;
module.exports.getUMLEnumerationView = getUMLEnumerationView;
module.exports.setUMLAssociationClassLinkView = setUMLAssociationClassLinkView;
module.exports.getUMLAssociationClassLinkView = getUMLAssociationClassLinkView;
