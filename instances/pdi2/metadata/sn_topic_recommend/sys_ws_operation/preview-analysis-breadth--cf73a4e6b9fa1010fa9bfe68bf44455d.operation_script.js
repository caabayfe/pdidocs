(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function validate(definition) {
		if (!definition.table) {
			return false;
		}
		return true;
	}
	
    var requestDefinition = request.body.data;
	var valid = validate(requestDefinition);
	
	if (!valid) {
		response.setStatus(400);
		response.setError("Invalid request: missing 'table'");
	}
	
    var gr = new GlideRecordSecure(requestDefinition.table);
	if (requestDefinition.filter) {
		gr.addEncodedQuery(requestDefinition.filter);
	}
	gr.query();
	var count = gr.getRowCount();

	response.setContentType('application/json');
	response.setStatus(200);
	response.setBody({count: count});

})(request, response);
