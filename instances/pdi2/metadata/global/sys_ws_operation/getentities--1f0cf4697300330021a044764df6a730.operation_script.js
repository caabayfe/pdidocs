(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
	return NLUStudioService.getEntities(request.queryParams.modelId.toString(), request.queryParams.intentId.toString()); 
	
})(request, response);
