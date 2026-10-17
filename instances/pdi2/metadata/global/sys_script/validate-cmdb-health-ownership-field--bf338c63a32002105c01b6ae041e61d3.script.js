(function executeRule(current, previous /*null when async*/) {
	var isValid = new CmdbHealthOwnershipValidator().validateColumn(current.getValue('value'));

	if (!isValid) {
		gs.addErrorMessage(gs.getMessage('Ownership value must be an attribute on [cmdb_ci] that references the User or User Group table. The value cannot be empty.'));
		current.setAbortAction(true);
	}
})(current, previous);
