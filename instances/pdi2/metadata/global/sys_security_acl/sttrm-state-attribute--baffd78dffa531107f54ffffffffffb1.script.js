function checkAccess() {
	if (!gs.nil(current.sttrm_state) && !gs.nil(current.sttrm_state.sttrm_model)) {
		var model = current.sttrm_state.sttrm_model.getRefRecord();
		return model.canWrite();
	}

	return false;
}

checkAccess();
