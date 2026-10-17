function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var type_value = g_form.getValue('type');
	
	// displays Breakdown Settings only when type = 'breakdown' and visualization = 'scorecard'
    g_form.setSectionDisplay('breakdown_settings', (type_value === 'breakdown' && newValue === 'scorecard'));
    
}
