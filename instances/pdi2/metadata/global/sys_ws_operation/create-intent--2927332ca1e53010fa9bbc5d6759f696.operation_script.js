(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function isValidRequest(data) {
		if (!data.modelName) {
			return false;
		}
		if (!data.intentName) {
			return false;
		}
		if (!data.primaryLanguage) {
			return false;
		}
		if (data.secondaryLanguages == null) {
			return false;
		}
		if (!NLUStudioService.createIntent) {
			return false;
		}
		return true;
	}
	
	function getSysId(modelId) {
		if (data.modelId) {
			status = NLUStudioService.getModelStatusByName(data.modelId);
			if (status) {
				return status.id;
			}
		}
		return '';
	}
	
	var data = request.body.data;
	
	if (!isValidRequest(data)) {
		response.setStatus(400);
		response.setBody({ errorMessage: "Invalid request, missing required fields or services." });
		return;
	}
	
	var result;
	var sysId;
	try {
		sysId = getSysId(data.modelId);
		result = NLUStudioService.createIntent({
			name: data.modelName,
			category: 'virtual_agent',
			sys_id: sysId,
			primaryLanguage: data.primaryLanguage,
			secondaryLanguages: data.secondaryLanguages
		}, data.intentName);
	} catch (e) {
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
		return;
	}
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
