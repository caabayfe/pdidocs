(function executeRule(current, previous /*null when async*/) {

	current.order = new StdChangeTaskUtils().getNextOrderNumber(current);

})(current, previous);
