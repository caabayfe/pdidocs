(function executeRule(current, previous /*null when async*/) {

	new SLABreakdownProcessor(current, previous).processBreakdowns();

})(current, previous);
