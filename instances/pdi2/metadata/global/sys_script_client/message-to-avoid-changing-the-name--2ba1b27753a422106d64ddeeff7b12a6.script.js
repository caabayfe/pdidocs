function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	//changing the name of an existing graph prevents queries against that old graph name from working
	if (isLoading) {
		return;
	}
	if (oldValue == '')
		return;
	
	if (g_form.isNewRecord())
		return;

	if (newValue == oldValue) {
		g_form.clearMessages();
		return;
	}
	
	//it's not a new record, the name existed already, and they are changing the name. We allow it but it's a bad idea
	g_form.addInfoMessage(getMessage("graph_name_change_inadvisable"));
	g_form.flash('name', '#FFFACD', 0);
}
