function buildExplorerRedirectURL() {
	var url = new GlideURL('$restapi.do');
	url.addParam('ns', g_scratchpad.namespace);
	url.addParam('service', g_scratchpad.service_name);
	
	if (g_scratchpad.is_versioned)
		url.addParam('version', g_scratchpad.version_id);
	
	url.addParam('resource_id', g_scratchpad.operation_sys_id);
	
	return url;
}

function openExplorerWindow() {
	var url = buildExplorerRedirectURL();
	var w = getTopWindow();
	var newWindow = w.open(url.getURL(), "_blank");
	newWindow.focus();
}
