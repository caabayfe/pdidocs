(function executeRule(current, previous /*null when async*/) {

	var maxTimeout = sn_atf.AutomatedTestingFramework.getMaxWaitTimeoutSeconds();

	var timeout = parseInt(current.timeout.dateNumericValue() / 1000);
	if (timeout > maxTimeout) {
		timeout = maxTimeout;
		current.timeout.setDateNumericValue(timeout * 1000);
		gs.addInfoMessage(
			gs.getMessage("The max timeout value was greater than the max timeout allowed for the test step. Adjusting to the max timeout allowed"));
	}

})(current, previous);
