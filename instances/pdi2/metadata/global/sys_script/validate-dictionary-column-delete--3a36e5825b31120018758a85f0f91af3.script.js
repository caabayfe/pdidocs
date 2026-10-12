(function executeRule(current, previous /*null when async*/) {
	if (current.name.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('No table name exists. The table name cannot be deleted.'));
	} else {
		var isDeletable = new DictionaryUtils().isDeletable(current);
		if (!current.canDelete() || !isDeletable) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Insufficient rights to delete column {0}. User does not have delete access.', current.element));
		}
	}
})(current, previous);
