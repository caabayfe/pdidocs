(function executeRule(current, previous /*null when async*/) {
	current.name = current.getDisplayValue("duration") + " @ " + current.getDisplayValue("period") + " period";
})(current, previous);
