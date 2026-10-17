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

	var subjectFilter = request.queryParams.subject;
	var format = request.queryParams['format'] || '';
	var writer;

	try {
		var schemaGr = new GlideRecord('sys_table_message_schema');
		schemaGr.addQuery('schema_id', schemaId);
		schemaGr.setLimit(1);
		schemaGr.query();

		response.setContentType(contentType);

		var schemaFound = false;
		if (schemaGr.next()) {
			var evolutionGr = new GlideRecord('sys_table_message_schema_evolution');
			evolutionGr.addQuery('table_message_schema', schemaGr.getUniqueValue());
			if (subjectFilter) {
				evolutionGr.addQuery('subject', subjectFilter);
			}
			evolutionGr.orderByDesc('version');
			evolutionGr.setLimit(1);
			evolutionGr.query();

			if (evolutionGr.next()) {
				schemaFound = true;
				var subject = evolutionGr.getValue('subject');
				var version = parseInt(evolutionGr.getValue('version'), 10);
				response.setStatus(200);
				writer = response.getStreamWriter();
				writer.writeString(JSON.stringify({
					subject: subject,
					version: version,
					schema: '' + schemaGr.getValue('schema'),
					guid: subject + ':' + version,
					ts: new GlideDateTime(schemaGr.getValue('sys_created_on')).getNumericValue(),
					deleted: false
				}));
			}
		}

		if (!schemaFound) {
			response.setStatus(404);
			writer = response.getStreamWriter();
			writer.writeString(JSON.stringify({error_code: 40403, message: 'Schema not found.'}));
		}
	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
