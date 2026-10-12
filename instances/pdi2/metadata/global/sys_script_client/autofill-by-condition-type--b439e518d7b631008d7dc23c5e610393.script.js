function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
	    // boolean setting remain the single src of truth
	    // reset the choice on load to whatever those fields are
	    var isEvent = g_form.getValue('event') == 'true';
	    var isElse = g_form.getValue('else_flag') == 'true';
		var isError = g_form.getValue('error') == 'true';
		newValue = isEvent ? 'event' : (isElse ? 'else_flag' : (isError ? 'error' : 'standard'));
		g_form.setValue('condition_type', newValue);
    }

	newValue = newValue.toLowerCase();

	if (newValue == 'standard') {
		g_form.setValue('error', 'false');
		g_form.setValue('event', 'false');
		g_form.setValue('else_flag', 'false');
		g_form.setDisplay('event', false);
		g_form.setMandatory('event_name', false);
		g_form.setDisplay('else_flag', false);
		g_form.setDisplay('event_name', false);
		g_form.setDisplay('condition', true);
		g_form.setDisplay('order', true);
		g_form.setDisplay('error', false);
	}

	if (newValue == 'error') {
		g_form.setValue('error', 'true');
		g_form.setValue('event', 'false');
		g_form.setValue('else_flag', 'false');
		g_form.setDisplay('event', false);
		g_form.setMandatory('event_name', false);
		g_form.setDisplay('else_flag', false);
		g_form.setDisplay('event_name', false);
		g_form.setDisplay('condition', true);
		g_form.setDisplay('order', true);
		g_form.setDisplay('error', false);
	}

	if (newValue == 'event') {
		g_form.setValue('error', 'false');
		g_form.setValue('event', 'true');
		g_form.setValue('else_flag', 'false');
		g_form.setDisplay('event', false);
		g_form.setMandatory('event_name', true);
		g_form.setDisplay('else_flag', false);
		g_form.setDisplay('event_name', true);
		g_form.setDisplay('condition', false);
		g_form.setDisplay('order', false);
		g_form.setDisplay('error', false);
	}

	if (newValue == 'else_flag') {
		g_form.setValue('error', 'false');
		g_form.setValue('event', 'false');
		g_form.setValue('else_flag', 'true');
		g_form.setDisplay('event', false);
		g_form.setMandatory('event_name', false);
		g_form.setDisplay('event_name', false);
		g_form.setDisplay('else_flag', false);
		g_form.setDisplay('condition', false);
		g_form.setDisplay('order', false);
		g_form.setDisplay('error', false);
	}

   
}
