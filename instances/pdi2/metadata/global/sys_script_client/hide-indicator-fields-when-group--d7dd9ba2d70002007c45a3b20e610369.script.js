function onChange(control, oldValue, newValue, isLoading, isTemplate) {		
	var show_relative = (g_form.getValue('type') == 'time' && g_form.getValue('visualization') == 'relative');
	var isValue = newValue.length > 0;
	var isValueChanged = newValue !== oldValue;
	
	if (show_relative)
		showIndicatorComponents(!isValue, isValueChanged);
}
function showIndicatorComponents(show, isValueChanged) {
	if (!show) {
		g_form.clearValue('indicator');
		g_form.clearValue('breakdown');
		g_form.clearValue('element');
		g_form.clearValue('breakdown_level2');
		g_form.clearValue('element_level2');
	} else if (isValueChanged) {
		g_form.clearValue('follow_element');
		g_form.clearValue('followed_breakdown');
	}
	
	g_form.setMandatory('indicator', show);
	g_form.setDisplay('indicator', show);
	
	g_form.setDisplay('breakdown', show);
	g_form.setDisplay('element', show);
	
	if(g_form.getValue('follow_element') != 'true') {
		g_form.setDisplay('breakdown_level2', show);
		g_form.setDisplay('element_level2', show);
	}
	
	if (show && g_form.getValue('indicator') == '') {
		g_form.setReadOnly('breakdown', show);
		g_form.setReadOnly('breakdown_level2', show);
	}
	
	g_form.setDisplay('chart_color', show);
}
