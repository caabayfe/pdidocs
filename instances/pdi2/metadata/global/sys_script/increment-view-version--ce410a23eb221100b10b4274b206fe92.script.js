incrementViewVersion();

function incrementViewVersion() {
	var version = 1;
	var gr = new GlideRecord('bsm_chart');
	gr.addQuery('ci', current.ci);
	gr.addQuery('user', current.user);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.orderByDesc('version');
	gr.setLimit(1);
	gr.query();
	if (gr.next())
			version = gr.version + 1;

	current.version = version;
}
