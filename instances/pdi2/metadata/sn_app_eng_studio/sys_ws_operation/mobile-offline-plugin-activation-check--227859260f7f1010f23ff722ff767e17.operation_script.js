(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var isActive = GlidePluginManager.isActive('com.glide.sg.offline');
	response.setBody({ active: isActive });
	response.setStatus(200);

})(request, response);
