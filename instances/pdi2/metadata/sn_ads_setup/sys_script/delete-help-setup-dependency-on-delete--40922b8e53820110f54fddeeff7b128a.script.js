(function executeRule(current, previous /*null when async*/) {

	current.setup_dependency.getRefRecord().deleteRecord();

})(current, previous);
