(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var pageId = request.pathParams.pageId;
	var acePageId = request.pathParams.acePageId;
	var result = [];
	var acePageGr = new GlideRecord("sn_ace_page");
	acePageGr.get(acePageId);
	var watchedClientScripts = [];
	if(acePageGr.isValid()) {
		var clientScriptIds = acePageGr.getValue("client_scripts");
		if(clientScriptIds) {
			watchedClientScripts = clientScriptIds.split(",");
		}
	}
	var gr = new GlideRecord("sys_ux_client_script");
	gr.addQuery("macroponent", pageId);
	gr.query();
	while(gr.next()) {
		if(watchedClientScripts.indexOf(gr.getUniqueValue()) > -1 || gr.getValue("name") == "beforePageLoad" || gr.getValue("name") == "beforePageLoadV3") {
			result.push({sysId: gr.getUniqueValue(), name: gr.getValue("name"), script: gr.getValue("script"), 
				includes: gr.getValue("includes"), watcher: watchedClientScripts.indexOf(gr.getUniqueValue()) > -1});		
		}
	}
	response.setBody(result);
})(request, response);
