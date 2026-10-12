function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   // when on hold is ticked set "on hold reason" to show and is mandatory unless we're loading
   if (newValue === 'true') {
		if (!isLoading)
			g_form.clearValue('on_hold_reason');
		g_form.setDisplay('on_hold_reason', true);
		g_form.setMandatory('on_hold_reason', true);
	} else {
		g_form.setMandatory('on_hold_reason', false);
		g_form.setDisplay('on_hold_reason', false);
	}
}
