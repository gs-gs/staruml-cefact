var forEach = require('async-foreach').forEach;

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

    objGraph['@id'] = 'https://edi3.org/2019/11/vocab#',
        objGraph['@type'] = 'owl:Ontology',
        objGraph['dc:title'] = 'EDI3 ontology',
        objGraph['dc:description'] = 'This document describes the RDFS vocabulary used for EDI3 UN/CEFACT Standards.',
        objGraph['dc:date'] = getDCDate(),
        objGraph['rdfs:seeAlso'] = getSeeAlso(),
        objGraph['rdfs_classes'] = getRdfsClassesArr(),
        objGraph['rdfs_properties'] = getRdfsPropertiesArr()


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
    let rdfsClassArr = [
        /* {# classes #} */
    ];
    return rdfsClassArr;
}

function getRdfsPropertiesArr() {
    let rdfsPropertiesArr = [
        /* {# properties #} */
    ];
    return rdfsPropertiesArr;
}
module.exports.generateJSONLD = generateJSONLD;