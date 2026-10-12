function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if(!g_form.isNewRecord() && newValue == 'update' && !isLoading)
		g_form.setValue('use_current_record_as_condition', true);
	
	if(g_form.isNewRecord() && newValue == 'update')
		g_form.setValue('use_current_record_as_condition', true);

}
