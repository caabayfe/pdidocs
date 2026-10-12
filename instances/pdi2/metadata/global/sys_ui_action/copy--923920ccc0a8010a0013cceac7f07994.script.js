var helper = new GlideappScriptHelper();
try {
	var request = helper.copyRequest(current);
	gs.addInfoMessage(gs.getMessage('Request copied successfully'));
	action.openGlideRecord(request);
} catch (e) {
	var catalogExceptionUtils = new CatalogExceptionUtils();
	if(catalogExceptionUtils.isCartException(e)) {
		gs.addErrorMessage(e.getMessage());
	}
}
