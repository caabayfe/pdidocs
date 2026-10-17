(function executeRule(current, previous /*null when async*/) {

	var currExpInterval = current.expiry_interval;
	var expIntervalLimit = gs.getProperty("jwt.provider.expiry.interval.limit");
	// If the given expiryInterval value is greater than the value of the 
	// property jwt.provider.expiry.limit property then don't submit the form and 
	// show an appropriate message on the form.
	if (currExpInterval > expIntervalLimit) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Expiry Interval (sec) cannot be greater than {0}. This limit is controlled by the jwt.provider.expiry.interval.limit system property.', expIntervalLimit));
	} else if(currExpInterval <= 0) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Expiry Interval (sec) cannot be less or equal to zero."));
	}

})(current, previous);
