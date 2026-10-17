function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	if(newValue === '')
		{
		g_form.setValue('record',false);
	}
	else
		{
		g_form.setValue('record',true);
	}
	
}
