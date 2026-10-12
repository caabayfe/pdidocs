(function executeRule(current, previous /*null when async*/) {

	current.dependent = current.dependent_on_field

})(current, previous);
