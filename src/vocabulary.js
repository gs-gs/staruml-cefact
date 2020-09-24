var forEach = require('async-foreach').forEach;
var utils = require('./utils');
var path = require('path');
const fs = require('fs');
const fields = require('./fields');
const constant = require('./constant');
let otherResources = [];

const JSON_FILE_FILTERS = [{
    name: 'JSON or JSON-LD Files',
    extensions: ['json','jsonld']
}];

function addTags(iTags) {
    let tags = [];
    forEach(iTags, tag => {
        let tagObj = {};
        tagObj.name = tag.name;
        tagObj.value = tag.value;
        tagObj.kind = tag.kind;
        tags.push(tagObj);
    });
    return tags;
}

/**
 * @function addDatatype
 * @description Export datatype package in export json file from staruml project
 * @param {Object} mMainObject
 */
function addDatatype(mMainObject) {
    /* Working with dataTypes */
    let dataTypes = app.repository.select(constant.datatype_pkg_name);
    if (dataTypes.length > 0) {
        forEach(dataTypes, element => {
            let dataTypeClasses = app.repository.select(element.name + "::@UMLDataType");
            let arrDataTypesClasses = [];
            mMainObject[fields.dataTypes] = arrDataTypesClasses;
            if (dataTypeClasses.length > 0) {
                forEach(dataTypeClasses, element => {
                    let dataTypeClassObject = {};
                    dataTypeClassObject[fields.name] = element.name;
                    if (element.documentation != "") {
                        dataTypeClassObject[fields.documentation] = element.documentation;
                    }
                    let tags = element.tags;
                    if (tags.length > 0) {
                        let tag = tags[0];
                        if (tag.reference != null) {
                            dataTypeClassObject[tag.name] = tag.reference.name;
                        }
                    }
                    arrDataTypesClasses.push(dataTypeClassObject);
                });
            }
        });
    }
}



/**
 * @function importFromVocabulary
 * @description Import selected json-ld vocabulary file
 */
function importFromVocabulary() {
    var mFiles = app.dialogs.showOpenDialog('Import file As JSON (.json)', null, JSON_FILE_FILTERS)
    if (mFiles == null) {
        return;
    }
    finalPath = mFiles[0];
    let filePath = finalPath;
    var contentStr = fs.readFileSync(filePath, 'utf8');
    var content = JSON.parse(contentStr);
    console.log("File Data : ", content);
    /*let dataTypesContent = content.dataTypes;*/

    let fileName = path.basename(filePath);
    let vDialog = app.dialogs.showModalDialog("", constant.title_import_mi, constant.title_import_mi_1 + fileName, [], true);
    setTimeout(() => {


        /* Adding Status Code Enum */
        if (!isStatusCodeAvail()) {
            addStatusCodeEnum();
        }/* else {
            addtatusCodeIfNotExist(dataTypesContent);
        }*/

        /* Adding / Updating Data Type Package */
        if (!isDatatypePkgAvail()) {
            addDataTypePackage();
        } /*else {
            updateDataTypePackage(dataTypesContent);
        }*/


        let statusCodes = app.repository.select(constant.status_code_enum_name)[0];
        statusCodes = statusCodes.literals;
        /*let statusCodes = [];*/
        let dataTypes = app.repository.select('::@UMLDataType');

        /* Updating Context -> Class, Properties */
        updateContextFromVocabulary(statusCodes, dataTypes, content);

        app.modelExplorer.rebuild();

        app.dialogs.showInfoDialog(fileName + constant.msg_import_success);

        vDialog.close();

    }, 5);
}

/**
 * @function updatingProperties
 * @description Update class properties or create new property if not exist
 * @param {UMLClass} mClass
 * @param {Array} properties
 * @param {Array} dataTypes
 * @param {Array} statusCodes
 */
function updatingPropertiesFromVocabulary(mClass, properties, dataTypes, statusCodes) {
    let mClassProperties = mClass.attributes;
    if (properties != null && properties.length > 0) {
        let newCreateProperties = [];
        forEach(properties, property => {
            let cProp = mClassProperties.filter(cProp => {
                return stripPrefix(property["@id"]) == cProp.name;
            });
            if (cProp.length != 0) {
                cProp = cProp[0];
                updateProperty(cProp, property, dataTypes, statusCodes);
            } else {
                let dataType = property["schema:rangeIncludes"];
                if(dataType.startsWith("xsd:")) {
                    console.log("Need to create property", stripPrefix(property["@id"]));
                    let createProperty = {};
                    createProperty[fields._type] = 'UMLAttribute';
                    createProperty[fields.name] = stripPrefix(property["@id"]);
                    createProperty[fields.documentation] = getStringIfArray(property["rdfs:comment"]);
                    createProperty[fields._parent] = {
                        '$ref': mClass._id
                    };

                    let createdProperty = app.repository.readObject(createProperty);
                    newCreateProperties.push({
                        'propContent': property,
                        'propAttrib': createdProperty
                    });
                } else {
                    newCreateProperties.push({
                        'propContent': property,
                        'propAttrib': null
                    });
                }
            }
        });

        if (newCreateProperties.length > 0) {
            forEach(newCreateProperties, cProp => {
                let dataType = cProp.propContent["schema:rangeIncludes"];
                if(dataType.startsWith("xsd:")) {
                    app.engine.addItem(mClass, fields.attributes, cProp.propAttrib);
                    updateProperty(cProp.propAttrib, cProp.propContent, dataTypes, statusCodes);
                } else {
                    console.log("Need to create : composition : ", dataType);

                    let newCreated = createRelationshipFromVocabulary(cProp.propContent, mClass);
                    /*updateCompositeRelationship(cProp.propContent, newCreated, statusCodes);*/
                }
            });
        }
    }
}


/**
 * @function updatingProperties
 * @description Update class properties or create new property if not exist
 * @param {UMLClass} mClass
 * @param {Object} entity
 * @param {Array} dataTypes
 * @param {Array} statusCodes
 */
function updatingProperties(mClass, entity, dataTypes, statusCodes) {
    let mClassProperties = mClass.attributes;
    let entityProperties = entity[fields.properties];
    if (entity.hasOwnProperty(fields.properties)) {

        if (entityProperties != null && entityProperties.length > 0) {

            let newCreateProperties = [];
            forEach(entityProperties, entityProp => {
                let cProp = mClassProperties.filter(cProp => {
                    return entityProp.name == cProp.name;
                });
                if (cProp.length != 0) {
                    cProp = cProp[0];

                    let name = '';
                    name = entityProp[fields.name];

                    updateProp(cProp, entityProp, dataTypes, statusCodes);


                } else {
                    console.log("Need to create properties", entityProp);
                    let createProperty = {};
                    createProperty[fields._type] = 'UMLAttribute';
                    createProperty[fields.name] = entityProp.name;
                    createProperty[fields._parent] = {
                        '$ref': mClass._id
                    };

                    let createdProperty = app.repository.readObject(createProperty);
                    newCreateProperties.push({
                        'propContent': entityProp,
                        'propAttrib': createdProperty
                    });
                }
            });

            if (newCreateProperties.length > 0) {
                forEach(newCreateProperties, cProp => {
                    app.engine.addItem(mClass, fields.attributes, cProp.propAttrib);
                    updateProp(cProp.propAttrib, cProp.propContent, dataTypes, statusCodes);
                });
            }

        }
    }
}

/**
 * @function updateProp
 * @description Update class property like datatype, status and multiplicity
 * @param {UMLAttribute} cProp
 * @param {Object} entityProp
 * @param {Array} dataTypes
 * @param {Array} statusCodes
 */
function updateProp(cProp, entityProp, dataTypes, statusCodes) {
    /* Updating datatype */
    if (entityProp.hasOwnProperty(fields.dataType)) {

        let dataType = '';
        dataType = entityProp[fields.dataType];

        let resDType = dataTypes.filter(dType => {
            return dType.name == dataType;
        });

        if (resDType.length != 0) {
            resDType = resDType[0];
        }

        app.engine.setProperty(cProp, fields.type, resDType);
    }

    /* Updating status */
    if (entityProp.hasOwnProperty(fields.status)) {

        updateStatus(entityProp, cProp, statusCodes);

    }

    /* Updating tags */
    if (entityProp.hasOwnProperty(fields.tags)) {

        updateTags(entityProp, cProp);

    }

    /* Updating multiplicity */
    if (entityProp.hasOwnProperty(fields.minCardinality) || entityProp.hasOwnProperty(fields.maxCardinality)) {

        updateMultiplicity(cProp, entityProp);

    }
}

/**
 * @function updateProperty
 * @description Update class property like datatype, status and multiplicity
 * @param {UMLAttribute} cProp
 * @param {Object} property
 * @param {Array} dataTypes
 * @param {Array} statusCodes
 */
function updateProperty(cProp, property, dataTypes, statusCodes) {
    /* Updating datatype */

    let dataType = property["schema:rangeIncludes"];

    if(property["@id"].endsWith("Text")){
        dataType = "Text"
    } else if(property["@id"].endsWith("Amount")){
        dataType = "Amount"
    } else if(property["@id"].endsWith("Code")){
        dataType = "Code"
    } else if(property["@id"].endsWith("BinaryObject")){
        dataType = "BinaryObject"
    } else if(property["@id"].endsWith("Date")){
        dataType = "Date"
    } else if(property["@id"].endsWith("DateTime")){
        dataType = "DateTime"
    } else if(property["@id"].endsWith("Graphic")){
        dataType = "Graphic"
    } else if(property["@id"].endsWith("Identifier")){
        dataType = "Identifier"
    } else if(property["@id"].endsWith("Indicator")){
        dataType = "Indicator"
    } else if(property["@id"].endsWith("Measure")){
        dataType = "Measure"
    } else if(property["@id"].endsWith("Numeric")){
        dataType = "Numeric"
    } else if(property["@id"].endsWith("Percent")){
        dataType = "Percent"
    } else if(property["@id"].endsWith("Picture")){
        dataType = "Picture"
    } else if(property["@id"].endsWith("Quantity")){
        dataType = "Quantity"
    } else if(property["@id"].endsWith("Rate")){
        dataType = "Rate"
    } else if(property["@id"].endsWith("Sound")){
        dataType = "Sound"
    } else if(property["@id"].endsWith("Time")){
        dataType = "Time"
    } else if(property["@id"].endsWith("Type")){
        dataType = "Type"
    } else if(property["@id"].endsWith("Value")){
        dataType = "Value"
    } else if(property["@id"].endsWith("Video")){
        dataType = "Video"
    }

    let resDType = dataTypes.filter(dType => {
        return dType.name == dataType;
    });

    if (resDType.length != 0) {
        resDType = resDType[0];
    }
    /*let resDType = dataTypes.filter(dType => {
        return dType.name == dataType;
    });

    if (resDType.length != 0) {
        resDType = resDType[0];
    }
*/
    app.engine.setProperty(cProp, fields.type, resDType);

    /* Updating status */
    //TODO: set status
    /*if (property.hasOwnProperty("unece:status")) {
        updateStatus(property, cProp, statusCodes);
    }*/
}
/**
 * @function updateMultiplicity
 * @description Update multiplicity of class property
 * @param {UMLAttribute} cProp
 * @param {Object} entityProp
 */
function updateMultiplicity(cProp, entityProp) {
    let minCardinality = '-1',
        maxCardinality = '-1';
    if (entityProp.hasOwnProperty(fields.minCardinality)) {
        minCardinality = entityProp[fields.minCardinality];
    }
    if (entityProp.hasOwnProperty(fields.maxCardinality)) {
        maxCardinality = entityProp[fields.maxCardinality];
    }

    let multiplicity = '';
    if (minCardinality == 0 && maxCardinality == 1) {
        multiplicity = '0..1';
    } else if (minCardinality == 1 && maxCardinality == 1) {
        multiplicity = '1';
    } else if (minCardinality == 0 && maxCardinality == '-1') {
        multiplicity = '0..*';
    } else if (minCardinality == 1 && maxCardinality == '-1') {
        multiplicity = '1..*';
    }

    app.engine.setProperty(cProp, fields.multiplicity, multiplicity);

    /* 
    '0..1'  =   minCardinality = 0, maxCardinality = 1;
    '1'     =   minCardinality = 1, maxCardinality = 1;
    '0..*   =   minCardinality = 0
    '1..*'  =   minCardinality = 1
    */
}

/**
 * @function updateContext
 * @description Update package with class, relationship and create class, relationship if not exist
 * @param {Array} statusCodes
 * @param {Array} dataTypes
 * @param {Object} content
 */
function updateContextFromVocabulary(statusCodes, dataTypes, content) {
    let graph = content['@graph'];
    let existingPackages = [];
    /**
     * check if all packages(resources) exist in the project
     * create ones which are missing
     */
    let existingPackage = app.repository.select("::@UMLPackage[name=" + "Vocabulary" + "]");
    if (existingPackage.length === 0) {
        console.log("Package to create ", "Vocabulary");
        let createPackage = {};
        createPackage[fields._type] = 'UMLPackage';
        createPackage[fields.name] = "Vocabulary";
        createPackage[fields._parent] = {
            '$ref': app.project.getProject()._id
        };
        let newPackage = app.repository.readObject(createPackage);
        existingPackages.push(newPackage);
        app.engine.addItem(app.project.getProject(), 'ownedElements', newPackage);
    } else {
        if (existingPackage.length > 1){
            console.warn("More than a single package matched the name " + resource.name + ", picking the first matched. Please check your packages naming.");
        }
        existingPackages.push(existingPackage[0]);
    }

    let classesFromPackage = [];
    let newCreatedClasses = [];
    let resourcePackages = existingPackages.filter(res => {
        return res.name == "Vocabulary";
    });

    if (resourcePackages.length != 0) {
        let rPackage = resourcePackages[0];
        classesFromPackage = app.repository.select(rPackage.name + "::@UMLClass");
        forEach(graph, item => {
            if (item.hasOwnProperty("@type") && item["@type"] == "rdfs:Class") {
                let resClass = classesFromPackage.filter(mClass => {
                    return mClass.name == stripPrefix(item["@id"]);
                });
                if (resClass.length != 0) {
                    let mClass = resClass[0];
                    console.log("---------------Classes to update : " + mClass.name);

                    let properties = graph.filter(property => {
                        let domainIncludes = property["schema:domainIncludes"];
                        if (domainIncludes instanceof Array){
                            return property["schema:domainIncludes"].includes(newClass.name);
                        }
                        else return property["schema:domainIncludes"] == newClass.name;
                    });
                    updatingPropertiesFromVocabulary(mClass, properties, dataTypes, statusCodes);
                    /*
                    updatingProperties(mClass, entity, dataTypes, statusCodes);
                    if (entity.hasOwnProperty(fields.tags)) {
                        updateTags(entity, mClass);
                    }
                    */

                } else {
                    console.log("Class to create ", stripPrefix(item["@id"]));
                    let createClass = {};
                    createClass[fields._type] = 'UMLClass';
                    createClass[fields.name] = stripPrefix(item["@id"]);
                    createClass[fields.documentation] = getStringIfArray(item["rdfs:comment"]);
                    createClass[fields._parent] = {
                        '$ref': rPackage._id
                    };
                    let newClass = app.repository.readObject(createClass);
                    newCreatedClasses.push(newClass);
                }
            }
        });

        if (newCreatedClasses.length > 0) {
            forEach(newCreatedClasses, newClass => {
                let resEntities = graph.filter(mEntity => {
                    return stripPrefix(mEntity["@id"]) == newClass.name;
                });
                if (resEntities.length != 0) {
                    console.log("---------------newClass.name : " + newClass.name);
                    let entity = resEntities[0];
                    app.engine.addItem(rPackage, fields.ownedElements, newClass);
                }
            });
            forEach(newCreatedClasses, newClass => {
                let resEntities = graph.filter(mEntity => {
                    return stripPrefix(mEntity["@id"]) == newClass.name;
                });
                if (resEntities.length != 0) {
                    let properties = graph.filter(property => {
                        if (property.hasOwnProperty("@type") && property["@type"] != "rdfs:Property") {
                            return false;
                        }
                        let domainIncludes = property["schema:domainIncludes"];
                        if (domainIncludes instanceof Array){
                            let strippedDomainIncludes = [];
                            forEach(domainIncludes, domain => {
                                strippedDomainIncludes.push(stripPrefix(domain));
                            })
                            return strippedDomainIncludes.includes(newClass.name);
                        }
                        else {
                            let strippedDomainIncludes = "";
                            if(property["schema:domainIncludes"] != undefined){
                                strippedDomainIncludes = stripPrefix(property["schema:domainIncludes"]);
                            }else {
                                console.log("schema:domainIncludes is undefined "+ property)
                            }
                            return strippedDomainIncludes == newClass.name;
                        }
                    });
                    console.log("---------------Properties size : " + properties.length);
                    updatingPropertiesFromVocabulary(newClass, properties, dataTypes, statusCodes);
                }
            });
        }
    }

}


/**
 * @function createCompositionRelationhip
 * @description Create new composition relationship in staruml if now exist while importing model interchange json file
 * @param {Object} eRelationship
 * @param {Object} mClass
 */
function createRelationshipFromVocabulary(eRelationship, mClass) {
    let sourceClass = null,
        targetClass = null;
    let resourceName = stripPrefix(eRelationship["schema:rangeIncludes"]);

    sourceClass = mClass;
    targetClass = app.repository.select("@UMLPackage[name=" + "Vocabulary" + "]::@UMLClass[name=" + resourceName + "]");
    if (targetClass.length != 0) {
        targetClass = targetClass[0];
    } else {
        targetClass = null;
    }

    if (sourceClass != null && targetClass != null) {
        let createNewComposition = {};
        createNewComposition[fields._type] = 'UMLAssociation';
        createNewComposition[fields._parent] = {
            '$ref': targetClass._id
        };
        createNewComposition[fields.documentation] = getStringIfArray(eRelationship["rdfs:comment"]);

        createNewComposition = app.repository.readObject(createNewComposition);
        createNewComposition = JSON.parse(app.repository.writeObject(createNewComposition));

        /* Creating source/end1 */
        let createEnd1 = {};
        createEnd1[fields._type] = 'UMLAssociationEnd';
        createEnd1[fields._parent] = {
            '$ref': createNewComposition._id
        };
        createEnd1[fields.reference] = {
            '$ref': sourceClass._id
        }
        createEnd1[fields.aggregation] = 'composition';
        let tmpCreatedEnd1 = app.repository.readObject(createEnd1);
        console.log("tmpCreatedEnd1", tmpCreatedEnd1);

        /* Creating target/end2 */
        let createEnd2 = {};
        createEnd2[fields._type] = 'UMLAssociationEnd';
        createEnd2[fields._parent] = {
            '$ref': createNewComposition._id
        };
        createEnd2[fields.reference] = {
            '$ref': targetClass._id
        }
        createEnd1[fields.aggregation] = 'none';
        let tmpCreatedEnd2 = app.repository.readObject(createEnd2);
        console.log("tmpCreatedEnd2", tmpCreatedEnd2);

        objEnd1 = JSON.parse(app.repository.writeObject(tmpCreatedEnd1));
        objEnd2 = JSON.parse(app.repository.writeObject(tmpCreatedEnd2));
        createNewComposition[fields.end1] = objEnd1;


        createNewComposition[fields.end2] = objEnd2;

        createNewComposition = app.repository.readObject(createNewComposition);

        app.engine.setProperty(createNewComposition, fields.name, stripPrefix(eRelationship["@id"]));

        app.engine.addItem(sourceClass, fields.ownedElements, createNewComposition);

        return createNewComposition;
    }
}


/**
 * @function updateTag
 * @description Update status of property or relationshp in staruml project
 * @param {Object} sObject
 * @param {Object} tElement
 */
function updateTags(sObject, tElement) {
    let tags = sObject[fields.tags];
    let cTags = tElement.tags;
    forEach(tags, tag => {
        let resTag = cTags.filter(cTag => {
            return tag.name == cTag.name;
        });
        if (resTag.length != 0) {
            let mTag = resTag[0];
            app.engine.setProperty(mTag, fields.value, tag.value);
            app.engine.setProperty(mTag, fields.kind, tag.kind);
        } else {
            console.log("Need to create a tag : ", tag.name);
            createTag(tag, tElement);
        }
    });
}

/**
 * @function updateStatus
 * @description Update status of property or relationshp in staruml project
 * @param {Object} sObject
 * @param {Object} tElement
 * @param {Array} statusCodes
 */
function updateStatus(sObject, tElement, statusCodes) {
    if(statusCodes.length == 0) return;
    let status = '';
    status = sObject[fields.status];
    let cTags = tElement.tags;
    let resTags = cTags.filter(tag => {
        return tag.name == [fields.status];
    });
    if (resTags.length != 0) {
        let mTag = resTags[0];
        let resSCode = statusCodes.filter(literal => {
            return literal.name == status;
        });
        if (resSCode.length != 0) {
            resSCode = resSCode[0];
            app.engine.setProperty(mTag, fields.reference, resSCode);
        }
    } else {
        console.log("Need to create status : ", status);
        createStatusTag(sObject, tElement);
    }
}

/**
 * @function addStatusCodeEnum
 * @description Add Status Code if not exist in staruml project
 */
function addStatusCodeEnum() {
    let project = app.project.getProject();
    let literals = ['active', 'deleted', 'deprecated', 'proposed'];
    let codeList ={};
    codeList[fields.name] = constant.status_code_enum_name;
    createEnumeration(codeList, project, literals);
}


/**
 * @function createEnumeration
 * @description Create UMLEnumeration with literals
 * @param {String} codeList
 * @param {Object} parentObj
 */
function createEnumeration(codeList, parentObj, literals) {
    let enumerationObj = {};
    enumerationObj[fields._type] = 'UMLEnumeration';
    enumerationObj[fields.name] = codeList.name;
    enumerationObj[fields.ownedElements] = [];
    enumerationObj[fields._parent] = {
        '$ref': parentObj._id
    }
    let newEnumeration = app.repository.readObject(enumerationObj);
    app.engine.addItem(parentObj, 'ownedElements', newEnumeration);

    forEach(literals, literal => {
        let literalObj = {};
        literalObj[fields._type] = 'UMLEnumerationLiteral';
        literalObj[fields.name] = literal;
        literalObj[fields._parent] = {
            '$ref': newEnumeration._id
        }

        let newLiteral = app.repository.readObject(literalObj);
        app.engine.addItem(newEnumeration, 'literals', newLiteral);
    });

}

function createCoreDataTypes(dataType, parentObj) {
    let dataTypeObj = {};
    dataTypeObj[fields._type] = 'UMLDataType';
    dataTypeObj[fields.name] = dataType.name;
    dataTypeObj[fields.documentation] = dataType.description;
    dataTypeObj[fields._parent] = {
        '$ref': parentObj._id
    }
    let newDataType = app.repository.readObject(dataTypeObj);
    app.engine.addItem(parentObj, 'ownedElements', newDataType);

}


function createLiteral(code, parentObj) {
    let literalObj = {};
    literalObj[fields._type] = 'UMLEnumerationLiteral';
    literalObj[fields.name] = code.name;
    literalObj[fields._parent] = {
        '$ref': parentObj._id
    }
    if(code.hasOwnProperty(fields.propertyValues)){
        let propertyValues = code.propertyValues;
        forEach(propertyValues, propertyValue => {
            if(propertyValue.propertyName.endsWith("#definitions/businessName")){
                literalObj[fields.name] = propertyValue.value;
                let tag = {};
                tag[fields.name] = fields.code;
                tag[fields.value] = code.name;
                tag[fields.type] = "string";
                createTag(tag, literalObj)
            }
        });
    }
    let newLiteral = app.repository.readObject(literalObj);
    app.engine.addItem(parentObj, fields.literals, newLiteral);
}

/**
 * @function isStatusCodeAvail
 * @description Check and return boolean if status code (UMLEnumeration) is available or not in staruml project
 */
function isStatusCodeAvail() {
    let result = app.repository.select(constant.status_code_enum_name);
    result = result.filter(mEnum => {
        return mEnum instanceof type.UMLEnumeration;
    });
    if (result.length == 1) {
        return true;
    } else {
        return false;
    }
}


/**
 * @function isDatatypePkgAvail
 * @description check and return boolean if datatype package is available in staruml project or not
 * @returns {Boolean}
 */
function isDatatypePkgAvail() {
    let project = app.project.getProject();
    let rootPackages = app.repository.select(project.name + "::@UMLPackage");
    let dataTypePkgResult = rootPackages.filter(pkg => {
        return pkg.name == constant.datatype_pkg_name;
    });
    if (dataTypePkgResult.length == 1) {
        return true;
    } else {
        return false;
    }
}


/**
 * @function addDataTypePackage
 * @description Create datatype package if not exist in staruml project when import model interchange json file
 * @param {Array} dataTypesContent
 */
function addDataTypePackage() {
    let project = app.project.getProject();
    let createDataTypePackage = {};
    let mainOwnedElements = [];

    createDataTypePackage[fields._type] = 'UMLPackage';
    createDataTypePackage[fields.name] = constant.datatype_pkg_name;
    createDataTypePackage[fields.ownedElements] = mainOwnedElements;
    createDataTypePackage[fields._parent] = {
        '$ref': project._id
    }
    let pkg = app.repository.readObject(createDataTypePackage);
    app.engine.addItem(project, 'ownedElements', pkg);
    let dataTypesContent = [];

    let dataType = {};
    dataType.name = "Amount";
    dataType.documentation = "A financial amount with defined currency from ISO-4217.";
    dataTypesContent.push(dataType);
    dataType = {};
    dataType.name = "BinaryObject";
    dataType.documentation = "A binary file URL. File type is indicated by file extension which must be a valid MIME type.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Code";
    dataType.documentation = "A code from a controlled list such as ISO-3166 country code.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Date";
    dataType.documentation = "Date";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "DateTime";
    dataType.documentation = "An ISO-8601 date/time string.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Graphic";
    dataType.documentation = "Graphic";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Identifier";
    dataType.documentation = "A controlled public identifier type such as a business registration number.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Indicator";
    dataType.documentation = "A yes/no, true/false, 1/0 boolean.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Measure";
    dataType.documentation = "A measured value with defined UOM from UNECE-Rec-20.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Numeric";
    dataType.documentation = "Any integer or floating point number";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Percent";
    dataType.documentation = "Whether the number is an integer, decimal, real number etc.";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Picture";
    dataType.documentation = "Picture";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Quantity";
    dataType.documentation = "Quantity";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Rate";
    dataType.documentation = "Rate";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Sound";
    dataType.documentation = "Sound";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Text";
    dataType.documentation = "";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Time";
    dataType.documentation = "Time";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Type";
    dataType.documentation = "Type";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Value";
    dataType.documentation = "Value";
    dataTypesContent.push(dataType);

    dataType = {};
    dataType.name = "Video";
    dataType.documentation = "Video";
    dataTypesContent.push(dataType);

    createDataType(dataTypesContent, pkg);

}

/**
 * @function createDataType
 * @description Create new datatype in datatype package if not exist in staruml project while importing model interchange json file
 * @param {Object} dataTypesContent
 * @param {Object} parent
 */
function createDataType(dataTypesContent, parent) {
    forEach(dataTypesContent, contentClass => {
        console.log("Created datatype : ", contentClass.name);
        let createClass = [];
        createClass[fields.name] = contentClass.name;
        createClass[fields._type] = 'UMLDataType';
        createClass[fields.documentation] = contentClass.documentation;
        let dtClass = app.repository.readObject(createClass);
        app.engine.addItem(parent, 'ownedElements', dtClass);

        if (contentClass.hasOwnProperty('status')) {
            createStatusTag(contentClass, dtClass);
        }
    });
}

/**
 * @function createStatusTag
 * @description Create new status (Tag) if not exist in property or relationship while importing model interchange json file in staruml
 * @param {Object} contentClass
 * @param {Object} dtClass
 */
function createStatusTag(contentClass, dtClass) {
    let statusName = contentClass.status;
    let arrTag = [];

    let createTag = {};
    createTag[fields._type] = 'Tag';
    createTag[fields.name] = 'status';
    createTag[fields.kind] = 'reference';
    createTag[fields._parent] = {
        '$ref': dtClass._id
    }
    let resultReference = app.repository.select(statusName);
    resultReference = resultReference.filter(refe => {
        return refe instanceof type.UMLEnumerationLiteral;
    });

    if (resultReference.length > 0) {
        createTag[fields.reference] = {
            '$ref': resultReference[0]._id
        }
    }
    let cTag = app.repository.readObject(createTag);
    arrTag.push(cTag);
    app.engine.setProperty(dtClass, 'tags', arrTag);

}
/**
 * @function createTag
 * @description Create new tag if not exist in property or relationship while importing model interchange json file in staruml
 * @param {Object} contentClass
 * @param {Object} parentObj
 * @param {string} kind
 */
function createTag(tag, parentObj) {
    let arrTag = [];
    if (parentObj.tags.length!=0){
        arrTag = parentObj.tags;
    }

    let createTag = {};
    createTag[fields._type] = 'Tag';
    createTag[fields.name] = tag.name;
    createTag[fields.value] = tag.value;
    if (tag.kind != null) {
        createTag[fields.kind] = tag.kind;
    } else {
        createTag[fields.kind] = 'hidden';
    }
    createTag[fields._parent] = {
        '$ref': parentObj._id
    }
    let cTag = app.repository.readObject(createTag);
    arrTag.push(cTag);
    app.engine.setProperty(parentObj, 'tags', arrTag);

}

function stripPrefix(idString) {
    let startIndex = idString.indexOf(":");
    if (startIndex!=-1){
        return idString.substring(startIndex+1);
    } else
        return idString;
}

function getStringIfArray(obj) {
    let result = "";
    if (obj instanceof Array){
        forEach(obj, item => {
            result = result + "* " + item + "\n";
        })
    }
    else result = obj;
    return result;
}
module.exports.importNewModel = importFromVocabulary;