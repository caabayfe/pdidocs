(function executeRule(current, previous /*null when async*/) {
	if (!current.default_group) {
		if (!current.source_table || !current.order) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("'Source table' and 'Order' fields are mandatory"));
		}
	}
	else {
		if (current.source_table || current.order) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("'Source table' and 'Order' fields should be empty when Default is true"));
		}
	}
})(current, previous);
