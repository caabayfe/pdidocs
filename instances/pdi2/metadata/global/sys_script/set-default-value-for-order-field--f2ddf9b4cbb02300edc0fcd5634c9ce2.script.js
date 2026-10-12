(function executeRule(current, previous /*null when async*/) {
	current.order = new ATFOrderUpdate().getNextOrder(current.getTableName(), current.test);
})(current, previous);
