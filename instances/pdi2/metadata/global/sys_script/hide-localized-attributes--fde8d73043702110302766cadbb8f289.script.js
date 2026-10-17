(function executeRule(current, previous /*null when async*/) {
	// show only non-local entries
	current.addNullQuery('is_localized').addOrCondition('is_localized', '!=', '1');
})(current, previous);
