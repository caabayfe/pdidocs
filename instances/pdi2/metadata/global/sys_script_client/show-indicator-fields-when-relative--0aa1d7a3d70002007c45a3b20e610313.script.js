function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	if(oldValue != 'relative' && g_form.getValue('type') != 'time')
		return;
	
	showIndicatorComponents();
}
function showIndicatorComponents() {
	g_form.clearValue('tag');
	
	g_form.setVisible('indicator', true);
	g_form.setMandatory('indicator', true);
	
	g_form.setVisible('breakdown', true);
	g_form.setVisible('breakdown_level2', true);
	g_form.setVisible('element', true);
	g_form.setVisible('element_level2', true);
}
