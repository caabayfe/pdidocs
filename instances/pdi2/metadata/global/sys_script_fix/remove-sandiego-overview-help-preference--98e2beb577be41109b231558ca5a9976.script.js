removeSandiegoUserPref();

function removeSandiegoUserPref() {
	if (!pm.isZboot()) {
		var gr = new GlideRecord("sys_user_preference");
		gr.setWorkflow(false);
		gr.addQuery('name', 'overview_help.visited.SanDiego');
		gr.query();
		while(gr.next()) {
			gr.deleteRecord();
		}
	}
}
