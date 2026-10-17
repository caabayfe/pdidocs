(function executeRule(current, previous /*null when async*/) {
	// filter_condition: nameVALCHANGES — platform gate that prevents loading on unrelated
	// UPDATE operations. Fires on all INSERTs (name changes from null to a value) and on
	// UPDATEs only when the name field changes.
	var excludeSysId = current.operation() === 'update' ? current.getUniqueValue() : '';

	if (Collection.doesCurrentUserHaveCollection(current.getValue('name'), excludeSysId)) {
		gs.addErrorMessage(
			gs.getMessage('Collection with name: {0} already exists.', [current.getValue('name')])
		);
		current.setAbortAction(true);
	}
})(current, previous);
