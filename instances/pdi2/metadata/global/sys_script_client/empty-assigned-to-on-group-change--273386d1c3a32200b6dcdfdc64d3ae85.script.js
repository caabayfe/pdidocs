function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	// Need to get the form value, in case it changes but then changes back to value in database (oldValue is always DB value)
	if (oldValue != newValue)
		g_scratchpad.formValue = newValue;

	if (newValue === '' || newValue == null || oldValue != newValue || newValue != g_scratchpad.formValue) {
		if(newValue && g_form.getValue("assigned_to")){
			var groupLookupGr = new GlideRecord('sys_user_grmember');
			groupLookupGr.addQuery('group.sys_id', newValue);
			groupLookupGr.addQuery('user', g_form.getValue("assigned_to"));
			groupLookupGr.setLimit(1);
			groupLookupGr.query(groupLookupCallback);
		} else {
			g_form.setValue("assigned_to", "");
		}
	}
}

function groupLookupCallback(groupLookupGr){
	if (!groupLookupGr.hasNext())
		g_form.setValue("assigned_to", "");
}
