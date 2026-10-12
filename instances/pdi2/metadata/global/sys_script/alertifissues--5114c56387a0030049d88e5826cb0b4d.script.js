(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('ecc_agent_issue');
	gr.addQuery('mid_server', current.sys_id);
	gr.addQuery('state','<>','resolved');
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("MID Server currently has {0} unresolved issue(s). Please address issues located below within the MID Server Issues table.", [gr.getRowCount()]));
	}

})(current, previous);
