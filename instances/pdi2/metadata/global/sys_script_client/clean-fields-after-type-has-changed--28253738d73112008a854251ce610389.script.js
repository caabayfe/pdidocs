function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
       return;
    }

    g_form.clearValue('indicator');
	g_form.clearValue('breakdown');
	g_form.clearValue('element');
	g_form.clearValue('breakdown_level2');
	g_form.clearValue('element_level2');
	g_form.clearValue('aggregate');
}
