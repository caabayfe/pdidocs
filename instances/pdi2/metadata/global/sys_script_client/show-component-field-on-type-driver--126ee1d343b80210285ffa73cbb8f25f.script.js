function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var actionType = g_form.getValue('action_type');
	if (actionType !== 'driver') {
		g_form.setMandatory('component', false);
		g_form.setDisplay('component', false);
	} else {
		g_form.setMandatory('component', true);
		g_form.setDisplay('component', true);
	}
}
