(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("wf_activity");
	gr.addQuery("workflow_version", current.getUniqueValue());
	gr.query();
	while(gr.next()) {
		var toDel = new GlideRecord("sys_variable_value");
		toDel.addQuery("document_key", gr.getUniqueValue());
		toDel.query();
		if(toDel.hasNext()) {
			toDel.deleteMultiple();
		}
	}
})(current, previous);
