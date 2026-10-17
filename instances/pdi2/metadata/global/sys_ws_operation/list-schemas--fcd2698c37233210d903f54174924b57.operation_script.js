(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   var responseStatus = 200;

	var accept = request.getHeader('Accept') || '';
	var contentType = 'application/json';
	if (accept.indexOf('application/vnd.schemaregistry.v1+json') >= 0) {
		contentType = 'application/vnd.schemaregistry.v1+json';
	} else if (accept.indexOf('application/vnd.schemaregistry+json') >= 0) {
		contentType = 'application/vnd.schemaregistry+json';
	}

	var subjectPrefix = request.queryParams.subjectPrefix || '';
	var latestOnly = request.queryParams.latestOnly == 'true';
	var offset = Math.max(0, parseInt(request.queryParams.offset, 10) || 0);
	var limit = parseInt(request.queryParams.limit, 10);
	if (isNaN(limit)) {
		limit = -1;
	}

	var schemas = [];
	var schemaGr;
	var writer;

	var firstRow = offset;
	var lastRow = limit >= 0 ? offset + limit : offset + 10000;

	try {
		if (latestOnly) {
			// GlideAggregate does not support chooseWindow() — paginate in memory
			var ga = new GlideAggregate('sys_table_message_schema_evolution');
			ga.addAggregate('MAX', 'version');
			ga.groupBy('subject');
			if (subjectPrefix) {
				ga.addQuery('subject', 'STARTSWITH', subjectPrefix);
			}
			ga.query();

			while (ga.next()) {
				var subject = ga.getValue('subject');
				var maxVersion = parseInt(ga.getAggregate('MAX', 'version'), 10);

				var evGr = new GlideRecord('sys_table_message_schema_evolution');
				evGr.addQuery('subject', subject);
				evGr.addQuery('version', maxVersion);
				evGr.setLimit(1);
				evGr.query();

				if (evGr.next()) {
					schemaGr = new GlideRecord('sys_table_message_schema');
					if (schemaGr.get(evGr.getValue('table_message_schema'))) {
						schemas.push(buildSchemaObject(evGr, schemaGr));
					}
				}
			}

			schemas = schemas.slice(offset);
			if (limit >= 0) {
				schemas = schemas.slice(0, limit);
			}
		} else {
			var gr = new GlideRecord('sys_table_message_schema_evolution');
			if (subjectPrefix) {
				gr.addQuery('subject', 'STARTSWITH', subjectPrefix);
			}
			gr.orderBy('subject');
			gr.orderBy('version');
			gr.chooseWindow(firstRow, lastRow);
			gr.query();

			while (gr.next()) {
				schemaGr = new GlideRecord('sys_table_message_schema');
				if (schemaGr.get(gr.getValue('table_message_schema'))) {
					schemas.push(buildSchemaObject(gr, schemaGr));
				}
			}
		}
	} catch (e) {
		response.setContentType(contentType);
		response.setStatus(500);
		writer = response.getStreamWriter();
		writer.writeString(JSON.stringify({error_code: 50001, message: 'Internal server error: ' + ('' + e)}));
		return;
	}

	response.setContentType(contentType);
	response.setStatus(responseStatus);
	writer = response.getStreamWriter();
	writer.writeString(JSON.stringify(schemas));

	function buildSchemaObject(evGr, schemaGr) {
		var subject = evGr.getValue('subject');
		var version = parseInt(evGr.getValue('version'), 10);
		return {
			subject: subject,
			version: version,
			id: parseInt(schemaGr.getValue('schema_id'), 10),
			guid: subject + ':' + version,
			schemaType: (schemaGr.getValue('type') || 'avro').toUpperCase(),
			schema: '' + schemaGr.getValue('schema'),
			ts: new GlideDateTime(schemaGr.getValue('sys_created_on')).getNumericValue(),
			deleted: false
		};
	}

})(request, response);
