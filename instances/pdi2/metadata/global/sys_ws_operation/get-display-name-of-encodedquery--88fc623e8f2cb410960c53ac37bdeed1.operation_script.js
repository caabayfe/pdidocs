(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var result = {
			table: '',
			encodedQuery: '',
			encodedQueryDisplayValue: '',
			errors: []
		};

	try {
		var table = request.queryParams.table;
		var query = request.queryParams.query;

		if (!table || !table.length || !table[0]) {
			result.errors.push('Table is missing.');
		} else {
			table = table[0];
			result.table = table;
		}
		
		query = !query || !query.length || !query[0] ? '' : query[0];
		result.encodedQuery = query;
		
		if (!result.errors.length) {
			var gr = new GlideRecord(table);
			gr.addEncodedQuery(query);
			result.encodedQueryDisplayValue = new GlideQueryFormatter().format(gr);
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	response.setBody(result);

})(request, response);
