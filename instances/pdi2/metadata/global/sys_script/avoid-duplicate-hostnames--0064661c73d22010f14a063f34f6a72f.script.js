(function executeRule(current, previous /*null when async*/) {

	if (current.hostname != previous.hostname) {	
		var hostnameHelper = new global.AllowedHostnameHelper();
		if (hostnameHelper.checkHostnameExists(current.hostname)) {
			gs.addErrorMessage(gs.getMessage('This hostname already exists in the list.'));
			current.setAbortAction(true);
		}
	}	

})(current, previous);
