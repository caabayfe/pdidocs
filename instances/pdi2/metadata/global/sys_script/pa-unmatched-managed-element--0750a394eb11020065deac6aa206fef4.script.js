(function executeRule(current, previous /*undefined when async or display*/) {

	if (!current.managed_breakdown || current.managed_breakdown === '') {
		current.managed_element = '';
	} else if (!current.managed_element || current.managed_element === '') {
		current.managed_element = 'unmatched';
	}   
	
})(current, typeof previous != 'undefined' ?  previous : null);
