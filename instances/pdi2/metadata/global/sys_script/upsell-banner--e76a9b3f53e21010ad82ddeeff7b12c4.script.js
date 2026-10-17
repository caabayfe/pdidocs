(function executeRule(current, previous /*null when async*/) {
    try {
        // getGlideURI() can throw so catch if it is null
        if(gs.action.getGlideURI().toString().includes('sys_cs_provider_list')) {
            gs.addInfoMessage(gs.getMessage('To create a new connection, please upgrade to access all features. Contact your Account Executive for more information.'));
		}
	} catch (e) {
	    // ignore
	}
})(current, previous);
