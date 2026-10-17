(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var spManager = new sn_nocpit.ServicePreviewManager();
	var queryParams = request.queryParams;
	var workspace = queryParams.workspace;
	var timestamp = queryParams.timestamp;
	var serviceId = request.pathParams.service_id;
	
	var responseString = String(spManager.getEMServicePreview(workspace, serviceId,timestamp));
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);
	
})(request, response);
