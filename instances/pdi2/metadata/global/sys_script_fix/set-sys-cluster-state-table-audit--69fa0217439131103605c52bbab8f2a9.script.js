enableSysClusterStateAudit();

function enableSysClusterStateAudit() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sys_cluster_state');
	gr.addQuery('internal_type', 'collection');
	gr.addNullQuery('element');
	gr.setWorkflow(false);
	gr.query();
	if (gr.next()) {
		gr.setValue('audit', 'true');
		gr.update();
	}
}
