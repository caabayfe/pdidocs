(function executeRule(current, previous /*null when async*/) {

	current.replace = current.operation + ':' + current.constant_value;

})(current, previous);
