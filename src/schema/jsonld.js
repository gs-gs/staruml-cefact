var forEach = require('async-foreach').forEach;
const constant = require('../constant');

/**
 * @function generateJSONLD
 * @description Generate JSON-LD
 */
function generateJSONLD() {
    let objJsonLD = {};
    objJsonLD['@context'] = getContext();
    objJsonLD['@graph'] = getGraph();
    return objJsonLD;

}

function getContext() {
    let arrContext = [];
    let objContext = {};


    objContext['@version'] = 1.1;
    objContext['@base'] = 'https://edi3.org/2019/11/vocab#';
    objContext['@language'] = 'en';
    objContext['rdf'] = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    objContext['rdfs'] = 'http://www.w3.org/2000/01/rdf-schema#';
    objContext['owl'] = 'http://www.w3.org/2002/07/owl#';
    objContext['xsd'] = 'http://www.w3.org/2001/XMLSchema#';
    objContext['dc'] = 'http://purl.org/dc/terms/';
    objContext['rdfs_classes'] = getRdfsClasses();
    objContext['rdfs_properties'] = getRdfsProperties();
    objContext['rdfs_datatypes'] = getRdfsDatatype();;
    objContext['rdfs_instances'] = getRdfsInstance();

    arrContext.push(objContext);

    return arrContext;

}

function getRdfsClasses() {
    let objRdfsClasses = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsClasses;

};

function getRdfsProperties() {
    let objRdfsProperties = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsProperties;
}

function getRdfsDatatype() {
    let objRdfsDatatype = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsDatatype;
}

function getRdfsInstance() {
    let objRdfsInstance = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsInstance;
}

function getGraph() {
    let objGraph = {};

    objGraph['@id'] = 'https://edi3.org/2019/11/vocab#';
    objGraph['@type'] = 'owl:Ontology';
    objGraph['dc:title'] = 'EDI3 ontology';
    objGraph['dc:description'] = 'This document describes the RDFS vocabulary used for EDI3 UN/CEFACT Standards.';
    objGraph['dc:date'] = getDCDate();
    objGraph['rdfs:seeAlso'] = getSeeAlso();
    objGraph['rdfs_classes'] = getRdfsClassesArr();
    objGraph['rdfs_properties'] = getRdfsPropertiesArr();


    return objGraph;
}

function getDCDate() {
    let dcDate = {
        "@value": "2019-11-29",
        "@type": "xsd:date"
    }
    return dcDate;
}

function getSeeAlso() {
    let sAlsoArr = [
        "https://edi3.org/"
    ];
    return sAlsoArr;
}

function getRdfsClassesArr() {
    let rdfsClassArr = [ /* {# classes #} */ ];
    let mUMLPackage = getUMLPackage();
    let mClasses = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLClass;
    });
    let mInterfaces = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLInterface;
    });
    let mEnumeration = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLEnumeration;
    });
    forEach(mClasses, function (mClass) {
        let tClass = {};
        tClass['@id'] = mClass.name;
        tClass['@type'] = 'rdfs:Class';
        tClass['rdfs:subClassOf'] = getParentClasses(mClass);

        rdfsClassArr.push(tClass);

        forEach(mClass.attributes, function (attr) {
            if (attr.type instanceof type.UMLEnumeration) {
                let mEnum = attr.type;
                let tClass = {};
                tClass['@id'] = mEnum.name;
                tClass['@type'] = 'rdfs:Class';
                rdfsClassArr.push(tClass);

                forEach(mEnum.literals, function (literal) {
                    let tLiteral = {};
                    tLiteral['@id'] = literal.name;
                    tLiteral['@type'] = 'rdfs:Class';
                    let mSubLiterals = [mEnum.name];
                    tLiteral['rdfs:subClassOf'] = mSubLiterals;
                    rdfsClassArr.push(tLiteral);
                });
            }
        });

    });

    /* forEach(mInterfaces, function (mInterface) {
        let tClass = {};
        tClass['@id'] = mInterface.name;
        tClass['@type'] = 'rdfs:Class';
        let mSubInterface = [];
        tClass['rdfs:subClassOf'] = getSubClasses(mSubInterface, mInterface);

        rdfsClassArr.push(tClass);

    }); */
    /* 
        forEach(mEnumeration, function (mEnum) {
            let tClass = {};
            tClass['@id'] = mEnum.name;
            tClass['@type'] = 'rdfs:Class';
            rdfsClassArr.push(tClass);

            forEach(mEnum.literals, function (literal) {
                let tLiteral = {};
                tLiteral['@id'] = literal.name;
                tLiteral['@type'] = 'rdfs:Class';
                let mSubLiterals = [mEnum.name];
                tLiteral['rdfs:subClassOf'] = mSubLiterals;
                rdfsClassArr.push(tLiteral);
            });

        });
     */

    return rdfsClassArr;
}

function getParentClasses(mElement) {
    let parentClasses = [];
    let generalization = app.repository.select("@UMLGeneralization");
    forEach(generalization, function (gen) {
        if (gen.source._id == mElement._id) {
            parentClasses.push(gen.target.name);
        }
    });
    return parentClasses;
}

function getSubClasses(subElements, mElement) {
    if (mElement.hasOwnProperty('_parent') && mElement._parent != null) {
        let mNElement = mElement._parent;
        subElements.push(mNElement.name);
        getSubClasses(subElements, mNElement);
    }
    return subElements;
}

function getRdfsPropertiesArr() {
    let rdfsPropertiesArr = [ /* {# properties #} */ ];
    let mUMLPackage = getUMLPackage();

    let associations = app.repository.select("@UMLAssociation");


    let mClasses = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLClass;
    });

    forEach(mClasses, function (mClass) {


        forEach(mClass.attributes, function (attr) {
            let objProperty = {};
            objProperty['@id'] = mClass.name + '/' + attr.name;
            objProperty['@type'] = 'rdf:Property';
            objProperty['rdfs:domain'] = mClass.name;

            let range=getRange(attr);
            objProperty['rdfs:range'] = getRange(attr);
        });

    });
    return rdfsPropertiesArr;
}

function isString(s) {
    return typeof (s) === 'string' || s instanceof String;
}

function getRange(attr) {
    let range = '';
    let starUMLType = attr.type;
    if (isString(starUMLType)) {

        if (starUMLType === 'Numeric') {
            range = 'xsd:nonNegativeInteger';
        } else if (starUMLType === 'Indicator') {
            range = 'xsd:boolean';
        } else if (starUMLType === 'Date') {
            range = 'xsd:date';
        } else if (starUMLType === 'DateTime') {
            range = 'xsd:dateTime';
        } else if (starUMLType === 'Integer') {
            range = 'xsd:int';
        } else if (starUMLType === 'Int32') {
            range = 'xsd:int';
        } else if (starUMLType === 'Int64') {
            range = 'xsd:long';
        } else if (starUMLType === 'Number') {
            range = 'xsd:integer';
        } else if (starUMLType === 'Float') {
            range = 'xsd:float';
        } else if (starUMLType === 'Double') {
            range = 'xsd:double';
        } else if (starUMLType === 'Boolean') {
            range = 'xsd:string';
        } else if (starUMLType === 'Password') {
            range = 'xsd:string';
        } else if (starUMLType === 'Byte') {
            range = 'xsd:byte';
        } else if (starUMLType === 'Binary') {
            range = 'xsd:string';
        } else if (starUMLType === 'Text') {
            range = 'xsd:string';
        } else if (starUMLType === 'Boolean') {
            range = 'xsd:boolean';
        }
    } else {
        range = starUMLType.name;
    }
    return range;
}

let UMLPackage = null;

function setUMLPackage(mUMLPackage) {
    UMLPackage = mUMLPackage;
}

function getUMLPackage() {
    return UMLPackage;
}
module.exports.generateJSONLD = generateJSONLD;
module.exports.setUMLPackage = setUMLPackage;
module.exports.getUMLPackage = getUMLPackage;