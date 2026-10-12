(function refineQuery(current, parent) {

	var gr = new GlideRecord("interaction_related_record");
	gr.addQuery("document_id", parent.sys_id);
	gr.setWorkflow(false);
	gr.query();

	var list = [];
	while (gr.next()) {
		list.push(gr.getValue("interaction") + '');
	}
	current.addQuery("sys_id", "IN", list);
})(current, parent);
