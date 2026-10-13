function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	if (newValue == 'sys_user') {
		g_form.setMandatory('user_field', false);
		g_form.setDisplay('user_field', false);
	}
	else {
		g_form.setMandatory('user_field', true);
		g_form.setDisplay('user_field', true);
	}
   
}
