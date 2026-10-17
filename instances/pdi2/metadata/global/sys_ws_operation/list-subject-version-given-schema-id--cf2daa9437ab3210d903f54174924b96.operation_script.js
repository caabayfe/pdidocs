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
	var writer;

	try {
		response.setContentType(contentType);

		var schemaGr = new GlideRecord('sys_table_message_schema');
		schemaGr.addQuery('schema_id', schemaId);
		schemaGr.setLimit(1);
		schemaGr.query();

		if (!schemaGr.next()) {
			response.setStatus(404);
			writer = response.getStreamWriter();
			writer.writeString(JSON.stringify({error_code: 40403, message: 'Schema not found.'}));
			return;
		}

		var evGr = new GlideRecord('sys_table_message_schema_evolution');
		evGr.addQuery('table_message_schema', schemaGr.getUniqueValue());
		if (subjectFilter) {
			evGr.addQuery('subject', subjectFilter);
		}
		evGr.orderBy('subject');
		evGr.orderBy('version');
		evGr.query();

		var pairs = [];
		while (evGr.next()) {
			pairs.push({
				subject: evGr.getValue('subject'),
				version: parseInt(evGr.getValue('version'), 10)
			});
		}

		response.setStatus(200);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify(pairs));

	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
