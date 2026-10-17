(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var pluginId = request.pathParams.pluginId;
	var pMgr = new GlidePluginManager();
	var isInstalledResponse = {};

	isInstalledResponse.isInstalled = pMgr.isActive(pluginId);
	response.setStatus(200);
	response.setBody(isInstalledResponse);
	return response;

})(request, response);
