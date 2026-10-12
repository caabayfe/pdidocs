(function process(request, response) {
	VCSResourceAccessCheck.verifyPluginAccess(request.pathParams.pluginId);
	
	response.setBody({
		isEnabled: GlidePluginManager.isActive(request.pathParams.pluginId)
	});
	response.setContentType('application/json');
	response.setStatus(200);

})(request, response);
