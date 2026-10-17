(function refineQuery(current, parent) {
	
	var gr = new GlideRecord('svc_ci_assoc');
	gr.addQuery('ci_id', parent.sys_id);
	gr.query();
	var prefix = '';
	var ids = '';
	while (gr.next()) {
		ids = ids + prefix + gr.getValue('service_id');
		prefix = ',';
	}
	current.addQuery("sys_id", "IN", ids);

})(current, parent);
