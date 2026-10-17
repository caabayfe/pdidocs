function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
		if (g_form.getValue("breakdown_interval") && g_form.getValue("check_in_frequency") != '')
            g_form.setReadOnly("check_in_frequency", true);
			
        return;
    }
    if (g_form.getValue("breakdown_interval") == '' && g_form.getValue("check_in_frequency") != '') {
        g_form.setValue("check_in_frequency", '');
        g_form.setReadOnly("check_in_frequency", false);
    }
    if (g_form.getValue("breakdown_interval") == 'quarterly' || g_form.getValue("breakdown_interval") == 'yearly') {
        if (g_form.getValue("check_in_frequency") != 'quarterly')
            g_form.setValue("check_in_frequency", 'quarterly');
        g_form.setReadOnly("check_in_frequency", true);
    }
}
