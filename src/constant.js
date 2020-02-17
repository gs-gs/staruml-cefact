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
     definitions:'definitions',
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
     msgpackage: 'Package not available',
     msg_file_select: 'Select one of the following type.',
     msg_pkg_diagram_select: 'Select \'Package\' or \'Diagram\' to test entire project.',
     msg_file_saveas: 'Save File as...',
     PREF_DEBUG_KEY: 'openapi:debug.status',
     PREF_GENDOC: 'openapi.gen.idlDoc',
     PREF_INDENTSPC: 'openapi.gen.indentSpaces',
     IDEAL_MDJ_FILE_PATH: '/src/model',
     IDEAL_MDJ_FILE_NAME: 'SampleModel.mdj',
     IDEAL_TEST_FILE_PATH: '/src/output',
     IDEAL_JSON_FILE_NAME: 'SampleModel.json',
     FIELD_SUCCESS: 'success',
     FIELD_ERROR: 'error',
     DISPLAY_REPO_NAME: reponame,
     DISPLAY_VERSION: version,
     JSONLD_MSG_PICKERDIALOG: "Select package to generate JSON-LD Specs.",
     DIALOG_MSG_PICKERDIALOG: "Select package or diagram to generate OpenAPI Specs.",
     DIALOG_MSG_ERRORDIALOG: "Please select the project or a package",
     DIALOG_MSG_ERROR_SELECT_PACKAGE: "Please select a package or diagram to generate OpenAPI Specification.",
     PACKAGE_SELECTION_ERROR: "No elements found in selected %s. Please select other %s.",
     JSON_LD_SUCCESS_MSG: "JSON-LD generated successfully at : ",
     DIALOG_MSG_TEST_PICKERDIALOG: "Select package or diagram to test OpenAPI Specs.",
     msg_description: "This OpenAPI Spec was generated using StarUML extension https://github.com/gs-gs/staruml-cefact  version: " + version,
     WARNING_VOCAB_MSG:"Warning: your vocabulary may be invalid because following properties have unknown or undefined type (range):\n",
     FILE_TYPE_JSON:1,
     FILE_TYPE_YML:2,
     FILE_TYPE_JSON_YML:3,
     FILE_TYPE_JSON_SCHEMA:4,
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
     }]

}

/**
 * @function getRef
 * @description returns the reference path of the schema
 * @returns {string}
 */
function getRef() {
     if(openAPI.getFileType() == Constant.FILE_TYPE_JSON_SCHEMA){
          return Constant.entry + Constant.path + Constant.definitions + Constant.path;
     }else{
          return Constant.entry + Constant.path + Constant.components + Constant.path + Constant.schemas + Constant.path;
     }
}
module.exports = Constant
module.exports.getReference = getRef;