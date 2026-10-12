function buildExplorerRedirectURL() {
	var url = new GlideURL('$restapi.do');
	url.addParam('ns', g_scratchpad.namespace);
	url.addParam('service', g_scratchpad.service_name);
	return url;
}

function openExplorerWindow() {
    if(!isOperationsDefined()) {
        alert('Specify a resource to explore this API');
        return;
    }
	var url = buildExplorerRedirectURL();
	var w = getTopWindow();
	var newWindow = w.open(url.getURL(), "_blank");
	newWindow.focus();
}

function isOperationsDefined(){
    var gr = new GlideRecord('sys_ws_operation');
    gr.addQuery('web_service_definition', g_form.getUniqueValue());
    gr.query();
    return gr.hasNext();
}
