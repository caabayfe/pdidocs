(function executeRule(current, previous /*null when async*/) {

	var tableName = current.getValue('table_name');
	var emailColumn = current.getValue('email_column');

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addQuery('element', emailColumn);
	gr.query();

	if (gr.next()) {
		var internalType = gr.getValue('internal_type');
		if (internalType !== 'email') {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('The selected email column "{0}" on table "{1}" is not an email type field. Please choose a field with internal type "email".', [emailColumn, tableName]));
		}
	} else {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The selected email column "{0}" was not found on table "{1}". Please choose a valid field.', [emailColumn, tableName]));
	}

})(current, previous);
