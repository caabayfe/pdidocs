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

	var offset = Math.max(0, parseInt(request.queryParams['offset'], 10) || 0);
	var limit = parseInt(request.queryParams['limit'], 10);
	if (isNaN(limit)) {
		limit = -1;
	}

	var writer;

	try {
		var firstRow = offset;
		var lastRow = limit >= 0 ? offset + limit : -1;

		var gr = new GlideRecord('sys_table_message_schema_evolution');
		gr.addQuery('subject', subject);
		gr.orderBy('version');
		if (lastRow >= 0) {
			gr.chooseWindow(firstRow, lastRow);
		} else {
			gr.chooseWindow(firstRow, firstRow + 10000);
		}
		gr.query();

		response.setContentType(contentType);

		if (gr.getRowCount() === 0) {
			// Subject genuinely does not exist
			response.setStatus(404);
			writer = response.getStreamWriter();
			writer.writeString(JSON.stringify({error_code: 40401, message: 'Subject not found.'}));
			return;
		}

		// Subject exists — collect the windowed page (may be empty if offset > total)
		var versions = [];
		while (gr.next()) {
			var version = parseInt(gr.getValue('version'), 10);
			if (!isNaN(version)) {
				versions.push(version);
			}
		}
		response.setStatus(200);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify(versions));
	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

})(request, response);
