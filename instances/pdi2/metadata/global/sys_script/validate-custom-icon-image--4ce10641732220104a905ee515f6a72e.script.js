(function executeRule(current, previous /*null when async*/) {

	if (!sn_snippets.QuickAction.validateIconImage(current.getUniqueValue())) {
		gs.addErrorMessage(gs.getMessage("The provided Custom icon image cannot be converted to an icon."));		
	}

})(current, previous);
