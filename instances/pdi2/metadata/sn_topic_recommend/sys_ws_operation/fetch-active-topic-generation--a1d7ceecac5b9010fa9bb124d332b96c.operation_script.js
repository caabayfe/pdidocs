(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var gr = new GlideRecord('sn_topic_recommend_topic_staging');
	gr.addQuery('status', '!=', 'complete');
	gr.addQuery('status', '!=', 'error');
	gr.addQuery('status', '!=', 'warning');
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
			language: gr.getValue('language'),
			status: gr.getValue('status')
		};
		results.push(result);
	}
	
    response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(results);

})(request, response);
