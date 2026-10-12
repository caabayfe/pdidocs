function checkAccess() {
	// Check if parent has run out on us
	var localParent = null;
	try {
		localParent = parent;
	}
	catch (e) {
		localParent = null;
	}

	// If it's not being created from a related list on sttrm_state return false
	if (localParent && localParent.getTableName() !== "sttrm_state")
		return false;

	//Check that we either have a local parent (new/edit from list) or a state (on insert of record)
	if (!localParent && current.sttrm_state.nil())
		return false;

	// Populate the model to check, confirming correct structure
	var model = null;
	if (localParent) {
		model = localParent.sttrm_model.getRefRecord();
	}
	else if (!gs.nil(current.sttrm_state) && !gs.nil(current.sttrm_state.sttrm_model)) {
		model = current.sttrm_state.sttrm_model.getRefRecord();
	}

	// If there's no model, no access
	if (!model)
		return false;

	return model.canWrite();
}

checkAccess();
