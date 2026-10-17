function onLoad() {
    // Attributes group, groups and users, if they exist, are fully deprecated and should be hidden
	var deprecatedFields = '';
	
	if (g_form.getControl('group')) {
		g_form.setDisplay('group',false);
		if (deprecatedFields != '') deprecatedFields += ', ';
		deprecatedFields += 'group';
	}
	if (g_form.getControl('groups')) {
		g_form.setDisplay('groups',false);
		if (deprecatedFields != '') deprecatedFields += ', ';
		deprecatedFields += 'groups';
	}
	if (g_form.getControl('users')) {
		g_form.setDisplay('users',false);
		if (deprecatedFields != '') deprecatedFields += ', ';
		deprecatedFields += 'users';
	}
	if (deprecatedFields != '') {
		var msg = getMessage('The following fields have been deprecated and should not be used: ') + deprecatedFields;
		g_form.addErrorMessage(msg);
	}
   
}
