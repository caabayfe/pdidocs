function onBefore(current, previous) {
if(GlideStringUtil.nil(GlideStringUtil.normalizeWhitespace(current.role))
 || GlideStringUtil.nil(GlideStringUtil.normalizeWhitespace(current.group))){
var errMsg = 'Either Group or Role field is empty. Provide valid values and try again';
gs.addErrorMessage(gs.getMessage(errMsg));  
current.setAbortAction(true); 
}
}
