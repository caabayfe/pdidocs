(function executeRule(current, previous /*null when async*/) {
	var template = current.template;
	try {
		JSON.parse(template);
	} catch(e) {
		gs.addErrorMessage(gs.getMessage('Template is not a valid JSON Object'));
		current.setAbortAction(true);
	}
})(current, previous);
