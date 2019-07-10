const Constant={
     entry:'#',
     components:'components',
     schemas:'schemas',
     path:'/',
     shared:'shared',
     msgsuccess:'OpenAPI generation completed',
     msg_file_select:'Select one of the following type.',
     msg_file_saveas:'Save File as...',
     PREF_DEBUG_KEY : 'openapi:debug.status',
     PREF_GENDOC : 'openapi.gen.idlDoc',
     PREF_INDENTSPC : 'openapi.gen.indentSpaces'
}
function getRef(){
     return Constant.entry+Constant.path+Constant.components+Constant.path+Constant.schemas+Constant.path;
}
module.exports=Constant
module.exports.getReference=getRef;
