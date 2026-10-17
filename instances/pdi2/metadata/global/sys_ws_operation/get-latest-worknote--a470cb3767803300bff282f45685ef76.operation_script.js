(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var table_name = decodeURIComponent(request.pathParams.table_name);
	var record_id = decodeURIComponent(request.pathParams.record_id);
	var gr = new GlideRecordSecure('sys_journal_field');
	gr.addQuery('element', 'work_notes');
	gr.addQuery('name', table_name);
	gr.addQuery('element_id', record_id);
	gr.orderByDesc('sys_created_on');
	gr.query();

	if (!gr.next())
		response.setBody({worknote: ''});
	else
		response.setBody({worknote: GlideStringUtil.getHTMLValue(gr.getValue('value'))});
})(request, response);
