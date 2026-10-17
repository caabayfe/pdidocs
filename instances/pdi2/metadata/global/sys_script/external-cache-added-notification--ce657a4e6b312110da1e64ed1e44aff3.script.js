(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage('External Credential Cache'));

	var gr = new GlideRecord('ecc_agent_config');
	gr.addQuery('sys_id', current.sys_id);
	gr.query();

	if(gr.next()) {
		var mid_sys_id = gr.ecc_agent;
		url = 'ecc_agent.do?sys_id=' + mid_sys_id;
		action.setRedirectURL(url);
	}
})(current, previous);
