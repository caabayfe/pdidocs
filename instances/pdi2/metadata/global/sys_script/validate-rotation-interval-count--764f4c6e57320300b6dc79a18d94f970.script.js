(function executeRule(current, previous /*null when async*/) {
	var intervalCount = parseInt(current.getValue("rotation_interval_count"));
	if (isNaN(intervalCount) || intervalCount <= 0){
		gs.addErrorMessage(gs.getMessage('"{0}" should be greater than zero', current.rotation_interval_count.getLabel()));
		current.setAbortAction(true);
	} else if (new OCRotaMember().rotaRepeatLimitExceeded(current))
		current.setAbortAction(true);

	if (gs.nil(current.rota)) return;
	var rotaGr = current.rota.getRefRecord();
	var isShiftOnOldEngine = new OnCallRotation().isShiftOnOldEngine(rotaGr);
	if (isShiftOnOldEngine && current.getValue("rotation_interval_type") == "monthly") {
		gs.addErrorMessage(gs.getMessage('{0} roster shift "{1}" is on the old schedule engine and cannot use a monthly rotation interval. Please select another option.', [current.getValue("name"), current.getDisplayValue("rota")]));
		current.setAbortAction(true);
	}
})(current, previous);
