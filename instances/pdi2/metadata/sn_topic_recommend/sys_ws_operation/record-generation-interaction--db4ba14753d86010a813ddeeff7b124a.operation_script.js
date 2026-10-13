(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	function getAddedTopics(reportId) {
		var gr = new GlideRecord('sn_topic_recommend_topic_staging');
		gr.addQuery('report', reportId);
		var statusCondition = gr.addQuery('status', 'complete');
		statusCondition.addOrCondition('status', 'error');
		gr.query();
		var generationIds = [];
		while (gr.next()) {
			generationIds.push(gr.getValue('generation_id'));
		}
		return generationIds;
	}

    function validate(fields) {
		if (!fields.reportId) {
			return false;
		}
		return true;
	}
	
	var metadata = request.body.data;
	var valid = validate(metadata);
	if (!valid) {
		response.setStatus(400);
		response.setError("Invalid request, missing required fields.");
		return;
	}
	
	var gr = new GlideRecord('sn_topic_recommend_view_status');
	var topicGenerationIds = getAddedTopics(metadata.reportId);
	gr.addQuery('report_id', 'IN', topicGenerationIds);
	gr.addQuery('report_type', 'generation');
	gr.addQuery('viewed', false);
	gr.query();
	while(gr.next()) {
		gr.setValue('viewed', true);
		gr.setValue('view_date', new GlideDate().getDisplayValue());
		gr.update();
	}

	response.setStatus(200);
})(request, response);
