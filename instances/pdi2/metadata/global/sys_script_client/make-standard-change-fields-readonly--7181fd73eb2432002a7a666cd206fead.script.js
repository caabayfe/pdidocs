function onLoad() {
	var readOnlyFields = g_scratchpad.std_chg_task_readonly_fields;
	
	if (!readOnlyFields || readOnlyFields.length == 0)
		return;
	
	for (var i = 0; i < readOnlyFields.length; i++)
		g_form.setReadOnly(readOnlyFields[i], true);
}
