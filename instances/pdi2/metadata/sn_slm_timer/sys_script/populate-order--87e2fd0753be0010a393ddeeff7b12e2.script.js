(function executeRule(current, previous /*null when async*/ ) {

	var slaTimerConfigMapping = new SLATimerConfigMapping(current);
	current.order = slaTimerConfigMapping.getNextOrder();

})(current, previous);
