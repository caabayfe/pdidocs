function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var allRoles = g_form.getValue('all_roles');
	if (newValue == 'true' || newValue == 'false')
		allRoles = newValue;
	
	if (allRoles == 'false') {
		g_form.setDisplay('roles', true);	   
	} else {
		g_form.setDisplay('roles', false);
	}
}
