(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // List endpoints always return 200 per spec — no 404 possible
	var accept = request.getHeader('Accept') || '';
	var contentType = 'application/json';
	if (accept.indexOf('application/vnd.schemaregistry.v1+json') >= 0) {
		contentType = 'application/vnd.schemaregistry.v1+json';
	} else if (accept.indexOf('application/vnd.schemaregistry+json') >= 0) {
		contentType = 'application/vnd.schemaregistry+json';
	}

	var subjectPrefix = request.queryParams['subjectPrefix'];

	var offset = Math.max(0, parseInt(request.queryParams['offset'], 10) || 0);
	var limit = parseInt(request.queryParams['limit'], 10);
	if (isNaN(limit)) {
		limit = -1;
	}

	var subjects = [];
	var writer;

	try {
		var ga = new GlideAggregate('sys_table_message_schema_evolution');
		ga.addAggregate('COUNT');
		ga.groupBy('subject');
		if (subjectPrefix) {
			ga.addQuery('subject', 'STARTSWITH', subjectPrefix);
		}
		ga.query();

		while (ga.next()) {
			var subject = ga.getValue('subject');
			if (subject) {
				subjects.push(subject);
			}
		}
	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

	// Pagination applied in-memory after full scan (GlideAggregate does not support row windowing)
	subjects = subjects.slice(offset);
	if (limit >= 0) {
		subjects = subjects.slice(0, limit);
	}

	response.setContentType(contentType);
	response.setStatus(200);
	writer = response.getStreamWriter();
	writer.writeString(JSON.stringify(subjects));
    
})(request, response);
