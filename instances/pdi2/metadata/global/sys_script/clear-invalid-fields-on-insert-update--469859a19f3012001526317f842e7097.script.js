(function executeRule(current, previous /*null when async*/) {

	// When the record is being saved
	// this before BR which clears out invalid fields
	if (current.getValue('source') === 'sys_user') {
		current.setValue('groups', '');
	} else if (current.getValue('source') === 'sys_user_group') {
		current.setValue('conditions', '');
	}

})(current, previous);
