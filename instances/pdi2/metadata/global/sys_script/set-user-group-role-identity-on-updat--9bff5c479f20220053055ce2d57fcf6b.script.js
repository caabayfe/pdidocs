(function executeRule(current, previous) {
	if (!JSUtil.nil(current.getValue('user')) && current.getValue('user') != previous.getValue('user'))
		process(/*type user*/ 3, current.getValue('user'));
	else if (!JSUtil.nil(current.getValue('role')) && current.getValue('role') != previous.getValue('role'))
		process(/*type role*/ 1, current.getValue('role'));
	else if (!JSUtil.nil(current.getValue('group')) && current.getValue('group') != previous.getValue('group'))
		process(/*type group*/ 2, current.getValue('group'));
})(current, previous);

function process(field, value) {
	switch(field) {
		case 1://if it is a role save the display value instead of sys_id; also empty any data already set for user or group
			var gr = new GlideRecord('sys_user_role');
			gr.get(value);
			value = gr.getDisplayValue();
			current.setValue('user', 'NULL');
			current.setValue('group', 'NULL');
			break;
		case 2://if is a group, empty any data already set for user or role
			current.setValue('user', 'NULL');
			current.setValue('role', 'NULL');
			break;
		case 3://if is a user, empty any data already set for group or role
			current.setValue('role', 'NULL');
			current.setValue('group', 'NULL');
			break;
	}
	current.setValue('identity', value);
	current.setValue('type', field);
}
