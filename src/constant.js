const Constant = {
     entry: '#',
     components: 'components',
     schemas: 'schemas',
     path: '/',
     shared: 'shared',
     msgsuccess: 'OpenAPI generation completed',
     msgpackage: 'Package not available',
     msg_file_select: 'Select one of the following type.',
     msg_package_select: 'Select one of the following package.',
     msg_file_saveas: 'Save File as...',
     PREF_DEBUG_KEY: 'openapi:debug.status',
     PREF_GENDOC: 'openapi.gen.idlDoc',
     PREF_INDENTSPC: 'openapi.gen.indentSpaces',
     IDEAL_MDJ_FILE_PATH: '/src/model',
     IDEAL_MDJ_FILE_NAME: 'SampleModel.mdj',
     IDEAL_TEST_FILE_PATH: '/src/output',
     IDEAL_JSON_FILE_NAME: 'SampleModel.json'
}

function getRef() {
     return Constant.entry + Constant.path + Constant.components + Constant.path + Constant.schemas + Constant.path;
}
module.exports = Constant
module.exports.getReference = getRef;