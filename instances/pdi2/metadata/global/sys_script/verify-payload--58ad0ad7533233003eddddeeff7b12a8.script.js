(function executeRule(current, previous /*null when async*/) {
	var rawPayload = current.getValue("payload_template");
	
	try {
		JSON.parse(rawPayload);
	} catch (e) {
		current.setAbortAction(true);
		gs.addErrorMessage('Invalid JSON for payload');
	}

})(current, previous);
