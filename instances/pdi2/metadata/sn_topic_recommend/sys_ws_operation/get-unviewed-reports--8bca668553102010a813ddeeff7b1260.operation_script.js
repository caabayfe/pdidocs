(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var gr = new GlideRecord('sn_topic_recommend_view_status');
	gr.addQuery('viewed', false);
	gr.query();
	var statuses = {
		analysis: {},
		generation: {}
	};
	while (gr.next()) {
		statuses[gr.report_type][gr.report_id] = {
			type: gr.getValue('report_type'),
			id: gr.getValue('report_id'),
			viewed: gr.getValue('viewed') === 'true',
			viewDate: gr.getValue('view_date'),
			createdDate: gr.getValue('sys_created_on'),
			updatedDate: gr.getValue('sys_updated_on')
		};
	}
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(statuses);

})(request, response);
