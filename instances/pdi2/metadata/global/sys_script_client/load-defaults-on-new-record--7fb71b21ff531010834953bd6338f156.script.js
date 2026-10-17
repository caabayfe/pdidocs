function onLoad() {
	if(!g_form.isNewRecord())
		return;
	
	g_form.setValue('filter_fields', 'assigned_to,state');
	g_form.setValue('assigned_to_field','assigned_to');
}
