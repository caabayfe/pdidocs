(function executeRule(current, previous /*null when async*/) {

	if(!SNC.AuthenticationHelper.isSafeURL(current.metadata_url)) {
		current.setAbortAction(true);
	}

})(current, previous);
