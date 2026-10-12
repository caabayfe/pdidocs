(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setContentType('application/json');
	
	var result = [];
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cmdb_ci');
	gr.addQuery('reference.name', 'sys_user_group');
	gr.query();
	while (gr.next()) {
		var field = {};
		field.label = gr.getValue('column_label');
		field.name = gr.getValue('element');
		field.sys_id = gr.getValue('sys_id');
		result.push(field);
	}
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
