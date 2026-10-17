(function executeRule(current, previous /*null when async*/) {
	if(gs.action.getGlideURI().toString().includes('sys_cs_context_profile_list.do')) {
		gs.addInfoMessage(gs.getMessage('To create a new chat experience, please upgrade to access all features. Contact your Account Executive for more information.'));
	}
})(current, previous);
