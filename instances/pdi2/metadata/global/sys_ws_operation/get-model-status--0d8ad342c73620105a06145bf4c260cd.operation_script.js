(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var modelId = request.pathParams.modelId;
	response.setContentType('application/json');
	if (!modelId) {
		response.setStatus(400);
		response.setBody({ errorMessage: 'No input model id provided' });
		return;
	}
	
	try {
		var status = NLUStudioService.getModelStatusByName(modelId, true);	
		var result =  {
			'sysId': status.id || '',
			'name': status.displayName || '',
			'id': modelId,
			'language': status.language || '',
			'scope': status.scope || '',
			'state': status.state || '',
			'type': status.type || '',
			'trainedVersion': status.trainedVersion || '',
			'publishedVersion': status.publishedVersion || '',
			'lastUpdatedOn': status.lastUpdatedOn || '',
			'lastTrainedOn': status.lastTrainedOn || '',
			'lastPublishedOn': status.lastPublishedOn || '',
			'publishStatus': status.publishStatus || '',
			'publishMessage': status.publishMessage || {}
		};
		
		response.setStatus(200);
		response.setBody(result);
		
	} catch (e) { 
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
	}

})(request, response);
