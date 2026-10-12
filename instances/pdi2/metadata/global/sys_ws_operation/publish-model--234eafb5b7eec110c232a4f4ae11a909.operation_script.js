(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	function isValidRequest(data) {
		if (!data.modelId) {
			return false;
		}
		return true;
	}
	
	var data = request.body.data;
	
	if (!isValidRequest(data)) {
		response.setStatus(400);
		response.setBody({ errorMessage: "Invalid request, missing required fields or services." });
		return;
	}

	var result;
	try {
		result = NLUStudioService.publishModels([data.modelId]);
	} catch (e) {
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
		return;
	}
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
