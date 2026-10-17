function checkAccess() {
	// Check if parent has run out on us
	var localParent = null;
	try {
		localParent = parent;
	}
	catch (e) {
		localParent = null;
	}

	// If it's not being created from a related list on sttrm_state_transition return false
	if (localParent && new TableUtils(localParent.getTableName()).getTables().indexOf("sttrm_model") === -1)
		return false;

	//Check that we either have a local parent (new/edit from list) or a state (on insert of record)
	if (!localParent && current.sttrm_model.nil())
		return false;

	// Populate the model to check, confirming correct structure
	var model = null;
	if (localParent) {
		model = localParent;
	}
	else if (current.sttrm_model) {
		model = current.sttrm_model.getRefRecord();
	}

	// If there's no model, no access
	if (!model)
		return false;

	return model.canWrite();
}

checkAccess();
