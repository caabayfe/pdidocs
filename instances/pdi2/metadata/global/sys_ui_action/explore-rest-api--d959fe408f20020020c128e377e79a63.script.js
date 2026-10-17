function buildExplorerRedirectURL() {
	var url = new GlideURL('$restapi.do');
	url.addParam('service','Import Set API');
	url.addParam('tableName', g_form.getValue('name'));
	return url;
}

function openExplorerWindow() {
	var url = buildExplorerRedirectURL();
	var w = getTopWindow();
	var newWindow = w.open(url.getURL(), "_blank");
	newWindow.focus();
}
