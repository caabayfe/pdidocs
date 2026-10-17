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
	// format transformation (e.g. 'resolved') is not supported; parameter is accepted but ignored

	var offset = Math.max(0, parseInt(request.queryParams['offset'], 10) || 0);
	var limit = parseInt(request.queryParams['limit'], 10);
	if (isNaN(limit)) {
		limit = -1;
	}

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

		var ga = new GlideAggregate('sys_table_message_schema_evolution');
		ga.addAggregate('COUNT');
		ga.groupBy('subject');
		ga.addQuery('table_message_schema', schemaGr.getUniqueValue());
		if (subjectFilter) {
			ga.addQuery('subject', subjectFilter);
		}
		ga.query();

		var subjects = [];
		while (ga.next()) {
			var subject = ga.getValue('subject');
			if (subject) {
				subjects.push(subject);
			}
		}

		subjects = subjects.slice(offset);
		if (limit >= 0) {
			subjects = subjects.slice(0, limit);
		}

		response.setStatus(200);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify(subjects));

	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
