(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var accept = request.getHeader('Accept') || '';
	var contentType = 'application/json';
	if (accept.indexOf('application/vnd.schemaregistry.v1+json') >= 0) {
		contentType = 'application/vnd.schemaregistry.v1+json';
	} else if (accept.indexOf('application/vnd.schemaregistry+json') >= 0) {
		contentType = 'application/vnd.schemaregistry+json';
	}

	var subject = request.pathParams.subject;
	if (!subject) {
		throw new sn_ws_err.BadRequestError("Missing required path parameter: subject");
	}

	var versionParam = request.pathParams.version;
	if (!versionParam) {
		throw new sn_ws_err.BadRequestError("Missing required path parameter: version");
	}

	var format = request.queryParams['format'] || '';
	// format transformation (e.g. 'resolved') is not supported; parameter is accepted but ignored

	// Resolve version: 'latest' and '-1' both mean the maximum version for the subject
	var isLatest = (versionParam === 'latest' || versionParam === '-1');
	var versionNum = -1;
	var writer;
	if (!isLatest) {
		versionNum = parseInt(versionParam, 10);
		// Valid range: 1 to 2^31-1 (2147483647)
		if (isNaN(versionNum) || versionNum < 1 || versionNum > 2147483647) {
			response.setContentType(contentType);
			response.setStatus(422);
			writer = response.getStreamWriter();
			writer.writeString(JSON.stringify({error_code: 42202, message: 'Invalid version.'}));
			return;
		}
	}

	try {
		response.setContentType(contentType);

		var evGr = new GlideRecord('sys_table_message_schema_evolution');
		evGr.addQuery('subject', subject);
		if (isLatest) {
			evGr.orderByDesc('version');
		} else {
			evGr.addQuery('version', versionNum);
		}
		evGr.setLimit(1);
		evGr.query();

		if (!evGr.next()) {
			// Distinguish subject-not-found (40401) from version-not-found (40402)
			var subjectCheckGr = new GlideRecord('sys_table_message_schema_evolution');
			subjectCheckGr.addQuery('subject', subject);
			subjectCheckGr.setLimit(1);
			subjectCheckGr.query();

			if (!subjectCheckGr.next()) {
				response.setStatus(404);
				writer = response.getStreamWriter();
				writer.writeString(JSON.stringify({error_code: 40401, message: 'Subject not found.'}));
			} else {
				response.setStatus(404);
				writer = response.getStreamWriter();
				writer.writeString(JSON.stringify({error_code: 40402, message: 'Version not found.'}));
			}
			return;
		}

		var schemaGr = new GlideRecord('sys_table_message_schema');
		if (!schemaGr.get(evGr.getValue('table_message_schema'))) {
			response.setStatus(404);
			writer = response.getStreamWriter();
			writer.writeString(JSON.stringify({error_code: 40402, message: 'Version not found.'}));
			return;
		}

		var resolvedSubject = evGr.getValue('subject');
		var resolvedVersion = parseInt(evGr.getValue('version'), 10);
		var schemaType = (schemaGr.getValue('type') || 'avro').toUpperCase();
		var responseObj = {
			subject: resolvedSubject,
			id: parseInt(schemaGr.getValue('schema_id'), 10),
			version: resolvedVersion,
			schemaType: schemaType,
			schema: '' + schemaGr.getValue('schema'),
			guid: resolvedSubject + ':' + resolvedVersion,
			ts: new GlideDateTime(schemaGr.getValue('sys_created_on')).getNumericValue(),
			deleted: false
		};

		response.setStatus(200);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify(responseObj));

	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
