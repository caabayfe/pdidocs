(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = request.body.data;

	// If there's no payload and no query parameter we can return an error.
	if (JSUtil.isEmpty(payload) || !payload.session_id || !payload.sys_id || !payload.table)
		return new sn_ws_err.BadRequestError("Invalid payload");

	//Check for a valid table and sys_id
	var validSysId = (/^[a-f0-9]{32}$/i).test(payload.sys_id);
	var checkTable = new GlideRecord(payload.table);
	if (!checkTable.isValid() || !validSysId)
		return new sn_ws_err.BadRequestError("Invalid payload");

	var gr = new GlideRecordSecure("cxs_relevant_doc");
	gr.addQuery("session_id", payload.session_id);
	gr.query();
	if (gr.next()) {
		gr.setValue("source_doc_table", payload.table);
		gr.setValue("source_doc", payload.sys_id);
		gr.setValue("source_doc_url", payload.table + ".do?sys_id=" + payload.sys_id);
		gr.update();
	}
})(request, response);
