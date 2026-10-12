(function executeRule(current, previous) {
	var currentState = current.state.toString();
	if (currentState === '5' && previous.state.toString() === '1') {
		return;
	}
	var previousState = previous.state + 1;
	// Validate if selected state is the next state
	if (currentState === previousState.toString()) {
		if (currentState === '3') {
			if (!current.asset_tag || !current.serial_number) {
				// If asset tag and serial number are set
				gs.addErrorMessage(gs.getMessage('Serial number and Asset tag are mandatory'));
				current.setAbortAction(true);
			} else if (!current.tracking_number || !current.carrier) {
				// If delivery tracking details are set
				gs.addErrorMessage(gs.getMessage('Delivery tracking details are mandatory'));
				current.setAbortAction(true);
			} else if (!current.return_tracking_number || !current.return_carrier) {
				// If return tracking details are set
				gs.addErrorMessage(gs.getMessage('Return tracking details are mandatory'));
				current.setAbortAction(true);
			}
		}
	} else {
		gs.addErrorMessage(gs.getMessage('State of the order can only be updated to next available state'));
		current.setAbortAction(true);
	}
}(current, previous));
