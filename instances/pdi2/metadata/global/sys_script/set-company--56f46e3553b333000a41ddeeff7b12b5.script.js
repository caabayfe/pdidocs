(function executeRule(current, previous /*null when async*/) {
	current.company = current.opened_for.company;
})(current, previous);
