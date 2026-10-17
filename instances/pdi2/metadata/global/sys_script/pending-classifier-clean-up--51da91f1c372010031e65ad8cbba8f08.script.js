(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('cmdb_ci_appl_pending');
	gr.addQuery('classifier', current.classifier);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();

	if (!gr.next()) {
		gr = new GlideRecord('discovery_classy_proc');
		gr.setWorkflow(false);
		if (current.classifier)
			gr.get('sys_id', current.classifier);
		gr.deleteRecord();
	}
})(current, previous);
