(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var pipelineTypeName = request.pathParams.name;
	var pipelineType = (new PipelineUtils()).getPipelineTypeByName(pipelineTypeName);
	
    response.setStatus(200);
	response.setBody(pipelineType);
})(request, response);
