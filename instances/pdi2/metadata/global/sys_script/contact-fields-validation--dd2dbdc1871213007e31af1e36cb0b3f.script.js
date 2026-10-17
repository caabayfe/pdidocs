(function executeRule(current, previous /*null when async*/ ) {
	
	var csmFlag = current.isValidField('consumer');
	var typeChoices = ['sys_user', 'sys_user_group', 'sn_publications_recipients_list', 'csm_consumer'];
	var fields = ['user', 'group', 'recipient_list', 'consumer'];
	var choice = typeChoices.indexOf(current.type + '');

	if (!current[fields[choice]]) {
		gs.addErrorMessage(gs.getMessage("Value for {0} is required, but has not been provided", current[fields[choice]].getLabel()));
		current.setAbortAction(true);
		return;
	}

	fields.splice(choice, 1);

	for (var i = 0; i < fields.length; i++) {
		if (fields[i] == 'consumer' && !csmFlag)
			continue;
		current[fields[i]] = '';
	}

})(current, previous);
