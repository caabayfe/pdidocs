function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	if (newValue == 'true' && g_form.getValue('name') == '')
		g_form.setValue('name', g_form.getValue('field'));

    //Type appropriate comment here, and begin script below

}
