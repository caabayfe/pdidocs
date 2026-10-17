(function executeRule(current, previous /*null when async*/) {
    	
	if (current.rules && current.rules != previous.rules) {
		// validate the json validity
		try {
			JSON.parse(current.rules);
			GlideCacheManager.flush('sa.ml.model');
		} catch (err) {
			var msg = gs.getMessage('Invalid json syntax (write aborted): {0}', [err]);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}
	}
})(current, previous);
