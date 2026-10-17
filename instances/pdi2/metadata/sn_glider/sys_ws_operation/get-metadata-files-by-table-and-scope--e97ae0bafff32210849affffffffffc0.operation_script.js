/* eslint-disable no-undef */
/* global gs, sn_glider, GlideRecordSecure, request, response */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var { table } = request.pathParams;
	var { scope } = request.pathParams;

	// Validate that table and scope are provided
	if (!table || !scope) {
		response.setStatus(400);
		response.setError(gs.getMessage('table and scope parameters are required'));
		return;
	}

	var gr = new GlideRecordSecure(table);
	gr.orderBy('sys_name');
	gr.addQuery('sys_scope', scope);
	gr.addActiveQuery();
	gr.query();

	response.setStatus(200);
	response.setHeader('Content-Type', 'application/json');

	var files = [];
	var formatter = new sn_glider.GliderRecordFormatter();

	while (gr.next()) {
		files.push(formatter.format(gr));
	}
	response.setBody(files);
})(request, response);
