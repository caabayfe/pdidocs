function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var DESKTOP = '0';
	
	if(newValue !== DESKTOP) {
		g_form.setValue('global', false);
		g_form.setVisible('global', false);
	} else {
		g_form.setVisible('global', true);
	}
}
