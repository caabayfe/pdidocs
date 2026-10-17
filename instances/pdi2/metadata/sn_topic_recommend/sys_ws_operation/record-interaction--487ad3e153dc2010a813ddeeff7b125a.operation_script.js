(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function validate(fields) {
		if (!fields.reportId) {
			return false;
		}
		if (!fields.reportType) {
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
	gr.addQuery('report_id', metadata.reportId);
	gr.addQuery('report_type', metadata.reportType);
	gr.query();
	while(gr.next()) {
		gr.setValue('viewed', true);
		gr.setValue('view_date', new GlideDate().getDisplayValue());
		gr.update();
	}

	response.setStatus(200);
})(request, response);
