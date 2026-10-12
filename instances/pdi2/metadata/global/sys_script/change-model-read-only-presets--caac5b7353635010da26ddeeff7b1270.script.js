(function executeRule(current, previous /*null when async*/ ) {
	var nameValuePairs = new ChangeModel(current.chg_model.getRefRecord()).getRecordPresetValues();
	if (Object.keys(nameValuePairs).some(function(key) { return current[key].changes(); })) {
		gs.addErrorMessage(gs.getMessage("Change model presets cannot be modified"));
		current.setAbortAction(true);
	}
})(current, previous);
