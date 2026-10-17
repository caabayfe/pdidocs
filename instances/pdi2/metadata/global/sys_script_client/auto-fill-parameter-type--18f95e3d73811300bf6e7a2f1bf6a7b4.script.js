function onLoad() {
	if (g_form.getValue('screen') && g_form.getValue('parameter_type') !== 'screen')
		g_form.setValue('parameter_type', 'screen');
	else if (g_form.getValue('button') && g_form.getValue('parameter_type') !== 'button')
		g_form.setValue('parameter_type', 'button');
}
