(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var doc_sys_id = request.queryParams.doc_sys_id;
	var field_name = request.queryParams.field_name;
	var field_value = request.queryParams.field_value;
    if (!doc_sys_id || !field_name || !field_value) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage('doc_sys_id, field_name, field_value is required.');
    }
	var gr = new GlideRecordSecure('ds_document');
	gr.addQuery('sys_id', doc_sys_id[0]);
	gr.query();
     if (gr.next() && gr.canWrite()) {
		if (!gr.isValidField(field_name))
			throw new sn_ws_err.ServiceError()
            .setStatus(404)
            .setMessage("Invalid Record Field");

		if (!gr.getElement(field_name).canWrite())
			throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage('Insufficient permissions');

		gr[field_name[0]] = field_value[0];
		gr.update();
		response.setStatus(200);
	} else {
        response.setStatus(500);
		response.setBody({error: "Internal server error"});
    }
})(request, response);
