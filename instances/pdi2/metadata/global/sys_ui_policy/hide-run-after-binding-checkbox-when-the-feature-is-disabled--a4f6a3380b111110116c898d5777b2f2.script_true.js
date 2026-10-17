function onCondition() {
	var runAfterBindingFieldName = 'run_after_binding';
	
	if (g_scratchpad && g_scratchpad.field_mapping_run_after_binding && g_scratchpad.field_mapping_run_after_binding === 'true') {
		g_form.setDisplay(runAfterBindingFieldName, true);
	} else {
		g_form.setDisplay(runAfterBindingFieldName, false);
	}
}
