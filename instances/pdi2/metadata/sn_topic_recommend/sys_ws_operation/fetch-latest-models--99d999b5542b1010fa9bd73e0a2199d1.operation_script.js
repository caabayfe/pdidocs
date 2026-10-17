(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var gr = new GlideRecord('sn_topic_recommend_topic_staging');
	gr.addQuery('status', 'complete');
	gr.orderByDesc('sys_created_on');
	gr.query();
	
	var results = {};
	var taxonomy;
	var modelId;
	var language;
	while (gr.next()) {
		taxonomy = gr.getValue('taxonomy');
		var secondaryLanguages = gr.getValue('secondary_languages');
		if (!results[taxonomy]) {
			results[taxonomy] = {
				id: gr.getValue('model'), 
				language: gr.getValue('language'), 
				secondaryLanguages: secondaryLanguages ? secondaryLanguages.split(',') : []
			};
		}
	}
	
	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(results);

})(request, response);
