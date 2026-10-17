(function executeRule(current, previous /*null when async*/) {
	try {
		new RegExp(current.matching_pattern, 'j');
    } catch (ex) {
        gs.addErrorMessage(gs.getMessage("Invalid regular expression pattern"));
        current.setAbortAction(true);
    }

})(current, previous);
