(function executeRule(current, previous /*null when async*/) {
	if (hasMembersOutOfScope())
		gs.addInfoMessage(gs.getMessage('inform need to toggle domain on group form'));

	function hasMembersOutOfScope() {
		var gr = new GlideRecord('sys_user_grmember');
		gr.addQuery('group', current.sys_id);
		gr.addNotNullQuery('sys_domain');
		gr.addQuery('sys_domain_path', '!=', '/');
		gr.addQuery('sys_domain_path', 'NOT LIKE', current.sys_domain_path + '%');
		gr.setLimit(1);
		gr.setWorkflow(false);
		gr.queryNoDomain();
		return gr.hasNext();
	}
})(current, previous);
