function buildExplorerRedirectURL() {
	var url = new GlideURL('$restapi.do');
	url.addParam('tableName', g_form.getValue('name'));
	return url;
}

function openExplorerWindow() {
    if(isWebServiceNotEnabledForTable()) {
        alert('This table is not configured to allow web service interaction. \n To allow access select the \'Allow access to this table via web services\', check box in the Application Access section and save your changes');
        return;
    }
	var url = buildExplorerRedirectURL();
	var w = getTopWindow();
	var newWindow = w.open(url.getURL(), "_blank");
	newWindow.focus();
}

function isWebServiceNotEnabledForTable() {
    return g_form.getValue('ws_access')=='false';
}
