(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var gr = new GlideRecord('sn_nlu_discovery_report_definition');
	gr.orderByDesc("sys_created_on");
	gr.query();
	var results = [];
	while (gr.next()) {
		var id = gr.getUniqueValue();
		var status = gr.getValue('status');
		var taxonomy = gr.getValue('model');
		var table = gr.getValue('table');
		var name = gr.getValue('name');
		var createdDate = gr.getValue('sys_created_on');
		var updatedDate = gr.getValue('sys_updated_on');
		results.push({
			id: id,
			status: status,
			taxonomy: taxonomy,
			table: table,
			name: name,
			createdDate: createdDate,
			updatedDate: updatedDate,
		});
	}
	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody(results);

})(request, response);
