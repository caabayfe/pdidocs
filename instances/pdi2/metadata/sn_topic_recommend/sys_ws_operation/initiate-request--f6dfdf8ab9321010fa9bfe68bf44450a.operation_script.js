(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function validate(definition) {
		if (!definition.taxonomy) {
			return false;
		}
		if (!definition.name) {
			return false;
		}
		if (!definition.table) {
			return false;
		}
		if (!definition.field) {
			return false;
		}
		return true;
	}
	
    var requestDefinitions = request.body.data;
    var records = [];

    for (var i = 0; i < requestDefinitions.length; i++) {

        var requestValidateDefinition = requestDefinitions[i];

        var valid = validate(requestValidateDefinition);
        if (!valid) {
            response.setStatus(400);
            response.setError("Invalid request, missing required fields.");
            return;
        }

    }

    for (var j = 0; j < requestDefinitions.length; j++) {

        var requestDefinition = requestDefinitions[j];

        var gr = new GlideRecord('sn_nlu_discovery_report_definition');
        gr.setValue('name', requestDefinition.name);
        gr.setValue('model', requestDefinition.taxonomy);
        gr.setValue('table', requestDefinition.table);
        gr.setValue('field', requestDefinition.field);
        gr.setValue('filter', requestDefinition.filter);
        var recordId = gr.insert();

        records.push(recordId);

    }

    if (records.length > 0) {
		
        response.setStatus(200);
        response.setContentType('application/json');
        response.setBody({
            records: records
        });
        
    } else {
        response.setStatus(400);
        response.setError("Invalid request, no requests processed.");
    }

})(request, response);
