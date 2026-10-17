(function executeRule(current, previous /*null when async*/) {
	var allowFrom = /^allow-from\s+(https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/?)$/;
	var value = current.getValue('value').toLowerCase();

	if (value !== "sameorigin" && value !== "deny" && !allowFrom.test(value)) {
		gs.addErrorMessage(sn_i18n.Message.getMessage("xframe_options_error", "Invalid value. The only valid values are 'SAMEORIGIN', 'DENY', or 'ALLOW-FROM' followed by a valid domain."));
		current.setAbortAction(true); // Prevents the property from being updated
	}
})(current, previous);
