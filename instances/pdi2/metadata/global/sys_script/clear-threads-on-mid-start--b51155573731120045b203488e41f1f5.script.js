(function executeRule(current, previous /*null when async*/) {
	var tgr = new GlideRecord('ecc_agent_thread');
	tgr.addQuery('ecc_agent', current.sys_id);
	tgr.deleteMultiple();
})(current, previous);
