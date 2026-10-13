(function executeRule(current, previous /*null when async*/) {
	if (current.applies_to == 'all') {
        current.mid_list = '';
    }
})(current, previous);
