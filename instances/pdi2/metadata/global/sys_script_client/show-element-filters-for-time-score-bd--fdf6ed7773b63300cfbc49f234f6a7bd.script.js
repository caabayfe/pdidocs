function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var type_value = g_form.getValue('type');
    if (type_value === 'breakdown' || type_value === 'time' || type_value === 'score') {
        if (type_value !== 'breakdown') {
            g_form.setValue('manual_elements', false);
        }
		
		// Element Settings tab should not be visible when visualization = pivot scorecard.
        g_form.setSectionDisplay('element_settings', (newValue !== 'pivot_scorecard'));

    } else {
        g_form.setSectionDisplay('element_settings', false);
        g_form.clearValue('elements_filter');
    }
}
