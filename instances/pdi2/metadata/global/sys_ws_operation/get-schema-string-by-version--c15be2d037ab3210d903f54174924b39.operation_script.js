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

		response.setStatus(200);
		writer = response.getStreamWriter();
		// Write the raw schema string unescaped — no JSON.stringify wrapper per spec
		writer.writeString('' + schemaGr.getValue('schema'));

	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
