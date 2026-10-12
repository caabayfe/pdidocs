(function executeRule(current, previous /*null when async*/) {
	current.parameter_name = current.parameter_name.replaceAll('_', '-');
})(current, previous);
