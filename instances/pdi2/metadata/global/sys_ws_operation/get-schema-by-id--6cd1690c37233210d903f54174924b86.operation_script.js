(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var accept = request.getHeader('Accept') || '';
	var contentType = 'application/json';
	if (accept.indexOf('application/vnd.schemaregistry.v1+json') >= 0) {
		contentType = 'application/vnd.schemaregistry.v1+json';
	} else if (accept.indexOf('application/vnd.schemaregistry+json') >= 0) {
		contentType = 'application/vnd.schemaregistry+json';
	}

	var idParam = request.pathParams.id;
	if (!idParam) {
		throw new sn_ws_err.BadRequestError("Missing required path parameter: id");
	}

	var schemaId = parseInt(idParam, 10);
	if (isNaN(schemaId)) {
		throw new sn_ws_err.BadRequestError("Invalid schema id: " + idParam + ". Must be a numeric value.");
	}

	var subjectFilter = request.queryParams['subject'];
	var format = request.queryParams['format'] || '';

	try {
		var gr = new GlideRecord('sys_table_message_schema');
		gr.addQuery('schema_id', schemaId);
		gr.setLimit(1);
		gr.query();

		var schemaFound = gr.next();
		if (schemaFound && subjectFilter) {
			var evGr = new GlideRecord('sys_table_message_schema_evolution');
			evGr.addQuery('table_message_schema', gr.getUniqueValue());
			evGr.addQuery('subject', subjectFilter);
			evGr.setLimit(1);
			evGr.query();
			schemaFound = evGr.next();
		}

		response.setContentType(contentType);
		var writer = response.getStreamWriter();
		if (schemaFound) {
			response.setStatus(200);
			writer.writeString(JSON.stringify('' + gr.getValue('schema')));
		} else {
			response.setStatus(404);
			writer.writeString(JSON.stringify({error_code: 40403, message: 'Schema not found.'}));
		}
	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
