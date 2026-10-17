var helper =  new GlideappScriptHelper();
var newRecord = helper.copyVariable(current);
if (newRecord) {
	gs.addInfoMessage(gs.getMessage('Variable copied successfully'));
	action.setRedirectURL(newRecord);
} else {
	gs.addErrorMessage(gs.getMessage('Variable could not be copied'));
	action.setRedirectURL(current);
}
