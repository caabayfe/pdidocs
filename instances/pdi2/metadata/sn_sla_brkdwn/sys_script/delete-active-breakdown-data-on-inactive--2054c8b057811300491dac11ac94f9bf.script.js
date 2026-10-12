(function executeRule(current, previous /*null when async*/) {

	new SLABreakdownDefinition(current).deleteBreakdownDataForActiveSLAs();

})(current, previous);
