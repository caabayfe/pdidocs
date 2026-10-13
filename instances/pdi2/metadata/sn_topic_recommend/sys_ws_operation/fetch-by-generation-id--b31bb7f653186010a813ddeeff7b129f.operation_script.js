(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var pathParams = request.pathParams;
	var generationId = pathParams.generationId;
	
	var gr = new GlideRecord('sn_topic_recommend_topic_staging');
	gr.addQuery('generation_id', generationId);
	gr.query();
	
	var results = [];
	var result;
	while (gr.next()) {
		result = {
			id: gr.getUniqueValue(),
			generationId: gr.getValue('generation_id'),
			taxonomy: gr.getValue('taxonomy'),
			modelId: gr.getValue('model'),
			modelName: gr.getValue('model_name'),
			intent: gr.getValue('intent'),
			topicId: gr.getValue('topic'),
			newTopicId: gr.getValue('topic_clone'),
			language: gr.getValue('language'),
			status: gr.getValue('status'),
			requestTypeId: gr.getValue('request_type')
		};
		
		var stagingErrors = gr.getValue('staging_error');
		if (stagingErrors){
			var parsedStagingErrors = JSON.parse(stagingErrors);

			var errorMessages = [];
			for (var i = 0; i < parsedStagingErrors.length; i ++) {
				var translatedErrorMessage = gs.getMessage(parsedStagingErrors[i].messageKey, parsedStagingErrors[i].replacements);
				errorMessages.push(translatedErrorMessage);
			}

			result['errorMessages'] = errorMessages;
		} else {
			result['errorMessages'] = null;
		}
		
		results.push(result);
	}
	
    response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(results);

})(request, response);
