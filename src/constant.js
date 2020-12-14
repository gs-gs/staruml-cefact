const utils = require('./utils');
const version = require('../package.json').version
const reponame = require('../package.json').name
const openAPI = require('./openapi');
const Constant = {
     entry: '#',
     GET: 'GET',
     POST: 'POST',
     PUT: 'PUT',
     DELETE: 'DELETE',
     PATCH: 'PATCH',
     components: 'components',
     schemas: 'schemas',
     path: '/',
     shared: 'shared',
     definitions: 'definitions',
     msgsuccess: 'OpenAPI Specs generated',
     msgstestuccess: 'OpenAPI Specs Tested Successfully',
     msgerror: 'OpenAPI Specs generation failure',
     msgtesterror: 'OpenAPI Specs Test Failure',
     titleopenapi: 'OpenAPI Specs Generation',
     strerror: 'Error : ',
     strerrorgenfail: 'Generation Failed!',
     strpath: 'File Generated at \nPath :',
     stronlypath: '\nPath : ',
     strend: '     ',
     PROGRESS_MSG: 'Please wait untill OpenAPI spec generation is being processed for the \'%s\' %s',
     PROGRESS_MSG_ENTIRE_PROJECT: "Please wait untill OpenAPI spec testing is being processed for the entire project.",
     STR_PACKAGE: 'package',
     STR_DIAGRAM: 'diagram',
     STR_MISSING_DESCRIPTION: 'missing description',
     msgpackage: 'Package not available',
     msg_file_select: 'Select one of the following type.',
     msg_pkg_diagram_select: 'Select \'Package\' or \'Diagram\' to test entire project.',
     msg_file_saveas: 'Save File as...',
     PREF_DEBUG_KEY: 'openapi:debug.status',
     PREF_GENDOC: 'openapi.gen.idlDoc',
     PREF_INDENTSPC: 'openapi.gen.indentSpaces',
     IDEAL_MDJ_FILE_PATH: '/src/model',
     IDEAL_MDJ_FILE_NAME: 'Sa mpleModel.mdj',
     IDEAL_TEST_FILE_PATH: '/src/output',
     IDEAL_VOCAB_ERROR_PATH: '/output',
     IDEAL_JSON_FILE_NAME: 'SampleModel.json',
     FIELD_SUCCESS: 'success',
     FIELD_ERROR: 'error',
     DISPLAY_REPO_NAME: reponame,
     DISPLAY_VERSION: version,
     JSONLD_MSG_PICKERDIALOG: "Select package to generate JSON-LD Specs.",
     DIALOG_MSG_PICKERDIALOG: "Select package or diagram to generate OpenAPI Specs.",
     DIALOG_MSG_PICKER_DIALOG_VOCABULARY: "Select package to import JSON-LD vocabulary.",
     DIALOG_MSG_ERRORDIALOG: "Please select the project or a package",
     DIALOG_MSG_ERROR_SELECT_PACKAGE: "Please select a package or diagram to generate OpenAPI Specification.",
     DIALOG_MSG_ERROR_SELECT_PACKAGE_VOCABULARY: "Please select a package to import JSON-LD vocabulary.",
     PACKAGE_SELECTION_ERROR: "No elements found in selected %s. Please select other %s.",
     STR_ISID_MSG: "There is no \'isID\' Attribute in Target Class \'%s\' which is referenced in the Source Class \'%s\'",
     STR_DUPLICATE_PROPERTY: "There is duplicate property in class \'%s\' and property name is \'%s\'",
     STR_WARNING_VOCABULARY: 'Warning: your vocabulary may be invalid because following properties have unknown or undefined type (range) in \'%s\' %s\n',
     STR_DUPLICATE_CLASSES: "There are duplicate \'%s\' %s for same name.",
     STR_MODEL_GENERATED: "model element generated",
     JSON_LD_SUCCESS_MSG: "JSON-LD generated successfully at : ",
     DIALOG_MSG_TEST_PICKERDIALOG: "Select package or diagram to test OpenAPI Specs.",
     msg_description: "This OpenAPI Spec was generated using StarUML extension https://github.com/gs-gs/staruml-cefact  version: " + version,
     DATA_TYPE_NOTE_LINKED_ERROR: 'Data type matches the name of a core type but is not linked to the type in \'%s\' %s\n',
     MSG_CORE_TYPE_NOT_AVAILABLE: "Core types not available",
     NOT_LINKED_TYPE_FILE_NAME: "notlinkedtype.txt",
     MSG_MORE_NOT_LINKED_TYPE: "There are more not lined types are wrote in file at ",
     MSG_MORE_VOCABS: "There are more vocabulary that is wrote in file at ",
     VOCABS_FILE_NAME: "vocab.txt",
     FILE_TYPE_JSON: 1,
     FILE_TYPE_YML: 2,
     FILE_TYPE_JSON_YML: 3,
     FILE_TYPE_JSON_SCHEMA: 4,
     MAX_LINES: 20,
     fileOptions: [{
               text: "JSON & YML",
               value: 3
          }, {
               text: "JSON",
               value: 1
          },
          {
               text: "YML",
               value: 2
          },
          {
               text: "JSON Schema",
               value: 4
          },
     ],
     pkgOptions: [{
          text: "Package",
          value: 1
     }, {
          text: "Diagram",
          value: 2
     }],
     MULTIPLICITY: {
          m0__star: '0..*',
          m1__star: '1..*',
          m0: '0',
          m1: '1'
     },

     datatype_pkg_name:'Core Data Types',
     title_import_mi_1: "Please wait untill model interchange is being processed for the \'",
     title_import_mi_2: "\' package",
     title_import_mi: "Model Interchange",
     title_import_mi_commit_history: "Model Interchange - Commit History",
     title_import_mi_commit_diff: "Model Interchange - Diff",
     title_import_mi_commit_status: "Model Interchange - Status",
     status_code_enum_name:'StatusCode',
     msg_import_success: ' imported successfully',

}

/**
 * @function getRef
 * @description returns the reference path of the schema
 * @returns {string}
 */
function getRef() {
     if (openAPI.getFileType() == Constant.FILE_TYPE_JSON_SCHEMA) {
          return Constant.entry + Constant.path + Constant.definitions + Constant.path;
     } else {
          return Constant.entry + Constant.path + Constant.components + Constant.path + Constant.schemas + Constant.path;
     }
}
module.exports = Constant
module.exports.getReference = getRef;