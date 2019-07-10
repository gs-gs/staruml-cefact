const Constant={
     entry:'#',
     components:'components',
     schemas:'schemas',
     path:'/'
}
function getRef(){
     return Constant.entry+Constant.path+Constant.components+Constant.path+Constant.schemas+Constant.path;
}
module.exports.constant = Constant;
module.exports.getReference=getRef;
