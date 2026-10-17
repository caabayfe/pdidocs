function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (g_form.getValue('substatus') == 'pre_allocated') {
		g_form.setValue('substatus', '');
		g_form.showFieldMsg('substatus', getMessage('Pre-allocated is not allowed for consumables'), 'error');
	}
}
