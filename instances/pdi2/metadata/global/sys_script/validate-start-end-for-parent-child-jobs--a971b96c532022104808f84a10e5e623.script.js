(function executeRule(current, previous /*null when async*/) {
	if (current != null &&
            (current.system_id == "ALL NODES" ||
            current.system_id == "ACTIVE NODES" ||
            current.system_id == "PRIMARY NODES")) {

				if (isRepeatEveryExcluded())
					gs.addErrorMessage(gs.getMessage("Starting and Ending are not currently supported for parent jobs. Clear the Starting and Ending fields to save the record."));
				else
					gs.addErrorMessage(gs.getMessage("Starting, Ending, and Repeat every are not currently supported for parent jobs. Clear the Starting, Ending, and Repeat every fields to save the record."));

				current.setAbortAction(true);
				return;
			}

	if (current != null && current.parent != "") {
		if (isRepeatEveryExcluded())
			gs.addErrorMessage(gs.getMessage("Starting and Ending are not currently supported for child jobs. Clear the Starting and Ending fields to save the record."));
		else
			gs.addErrorMessage(gs.getMessage("Starting, Ending, and Repeat every are not currently supported for child jobs. Clear the Starting, Ending, and Repeat every fields to save the record."));

		current.setAbortAction(true);
	}

	//Repeat Every is not used in "Day and Month in Year", "Day in Week in Month in Year", "Repeat" and "Interval" trigger types
	function isRepeatEveryExcluded() {
		return current.trigger_type == 6 || current.trigger_type == 7 || current.trigger_type == 1 || current.trigger_type == 10;
	}
})(current, previous);
