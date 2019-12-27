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

/**
 * @function getContext
 * @description returns the array of JSON-LD context template
 * @returns {Array}
 */
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

/**
 * @function getRdfsClasses
 * @description returns the object of rdf classes
 * @returns {Object}
 */
function getRdfsClasses() {
    let objRdfsClasses = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsClasses;

};

/**
 * @function getRdfsProperties
 * @description returns the object of rdf properties
 * @returns {Object}
 */
function getRdfsProperties() {
    let objRdfsProperties = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsProperties;
}

/**
 * @function getRdfsDatatype
 * @description returns the object of rdf datatype
 * @returns {Object}
 */
function getRdfsDatatype() {
    let objRdfsDatatype = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsDatatype;
}

/**
 * @function getRdfsInstance
 * @description returns the object of rdf instance
 * @returns {Object}
 */
function getRdfsInstance() {
    let objRdfsInstance = {
        "@reverse": "rdfs:isDefinedBy",
        "@type": "@id"
    };

    return objRdfsInstance;
}

/**
 * @function getGraph
 * @description returns the object of graph template
 * @returns {Object}
 */
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

/**
 * @function getDCDate
 * @description returns the object of dcdate
 * @returns {Object}
 */
function getDCDate() {
    let dcDate = {
        "@value": "2019-11-29",
        "@type": "xsd:date"
    }
    return dcDate;
}

/**
 * @function getSeeAlso
 * @description returns the object of seealso
 * @returns {Object}
 */
function getSeeAlso() {
    let sAlsoArr = [
        "https://edi3.org/"
    ];
    return sAlsoArr;
}

function getAttrTypeClass(mClasses){
    let mNewClasses=[];
    forEach(mClasses, function (mClass) {
        forEach(mClass.attributes, function (attr) {
            if(attr.type instanceof type.UMLClass){
                let res=mNewClasses.filter(function(item){
                    return attr.type._id == item._id;
                });
                if(res.length==0){
                    mNewClasses.push(attr.type);
                }
            }
        });
    });
    return mNewClasses;
}
/**
 * @function getRdfsClassesArr
 * @description returns the array of classes 
 * @returns {Array}
 */
function getRdfsClassesArr() {
    let rdfsClassArr = [ /* {# classes #} */ ];
    let mUMLPackage = getUMLPackage();
    let mClasses = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLClass;
    });

    let mNewClasses=getAttrTypeClass(mClasses);
    mNewClasses=mClasses.concat(mNewClasses);

    forEach(mNewClasses, function (mClass) {
        let tClass = {};
        tClass['@id'] = mClass.name;
        tClass['@type'] = 'rdfs:Class';
        tClass['rdfs:subClassOf'] = getParentClasses(mClass);

        rdfsClassArr.push(tClass);

        forEach(mClass.attributes, function (attr) {
            if (attr.type instanceof type.UMLEnumeration ) {
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

    return rdfsClassArr;
}

/**
 * @function getParentClasses
 * @description returns the array of parent classes
 * @returns {Array}
 */
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

/**
 * @function getRdfsPropertiesArr
 * @description returns the array class properties with template
 * @returns {Array}
 */
function getRdfsPropertiesArr() {
    let rdfsPropertiesArr = [ /* {# properties #} */ ];
    let mUMLPackage = getUMLPackage();

    let associations = app.repository.select("@UMLAssociation");


    let mClasses = mUMLPackage.ownedElements.filter(function (element) {
        return element instanceof type.UMLClass;
    });

    let mNewClasses=getAttrTypeClass(mClasses);
    mNewClasses=mClasses.concat(mNewClasses);

    forEach(mNewClasses, function (mClass) {


        forEach(mClass.attributes, function (attr) {
            let objProperty = {};
            objProperty['@id'] = mClass.name + '/' + attr.name;
            objProperty['@type'] = 'rdf:Property';
            objProperty['rdfs:domain'] = mClass.name;

            let range=getRange(attr);
            objProperty['rdfs:range'] = range;//getRange(attr);
            /* if(isString(attr.type) && range!=''){
                rdfsPropertiesArr.push(objProperty);
            }
            else{

            } */
            rdfsPropertiesArr.push(objProperty);

        });
        

        let classAssociations = associations.filter(item => {
            return item.end1.reference._id == mClass._id
        });

        classAssociations.forEach(assoc => {
            if (assoc instanceof type.UMLAssociation) {

                let relationName = assoc.name;
                if (relationName != '') {
                    let range = assoc.end2.reference.name;
                    
                    
                    let objProperty = {};
                    objProperty['@id'] = mClass.name + '/' + relationName;
                    objProperty['@type'] = 'rdf:Property';
                    objProperty['rdfs:domain'] = mClass.name;
                    objProperty['rdfs:range'] = range;

                    rdfsPropertiesArr.push(objProperty);
                }

            }
        });
    });
    return rdfsPropertiesArr;
}

/**
 * @function isString
 * @description returns boolean that checks values is string or any object
 * @returns {boolean}
 */
function isString(s) {
    return typeof (s) === 'string' || s instanceof String;
}

/**
 * @function getRange
 * @description returns datatype
 * @returns {string}
 */
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
        } else if (starUMLType === 'Measure') {
            range = 'Measure';
        } else if (starUMLType === 'Code') {
            range = 'Code';
        } else if (starUMLType === 'Identifier') {
            range = 'Identifier';
        } else if (starUMLType === 'Amount') {
            range = 'Amount';
        } 
    } else {
        range = starUMLType.name;
    }
    return range;
}

let UMLPackage = null;

/**
 * @function setUMLPackage
 * @description save UMLPackage
 */
function setUMLPackage(mUMLPackage) {
    UMLPackage = mUMLPackage;
}

/**
 * @function getUMLPackage
 * @description return UMLPackage
 * @returns {UMLPackage}
 */
function getUMLPackage() {
    return UMLPackage;
}
module.exports.generateJSONLD = generateJSONLD;
module.exports.setUMLPackage = setUMLPackage;
module.exports.getUMLPackage = getUMLPackage;