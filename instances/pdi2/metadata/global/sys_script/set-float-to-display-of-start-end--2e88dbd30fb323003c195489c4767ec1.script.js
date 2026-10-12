(function executeRule(current, previous /*null when async*/) {

	current.float_start = current.getDisplayValue('start');
	current.float_end = current.getDisplayValue('end');

})(current, previous);
