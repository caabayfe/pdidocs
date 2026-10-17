function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '')
		return;
	
	var s = newValue;
	var fixedValue = s.toLowerCase()
					.replace(/[^a-z0-9\-]/gi, '_')
					.replace(/^-|-$/g, '');

	var gr = new GlideRecord("sp_widget");
	gr.addQuery("id", fixedValue);
	gr.addQuery("sys_id", "!=", g_form.getUniqueValue());
	gr.query(function() {
		if (gr.next())
			g_form.showFieldMsg("id", "Widget ID already exists, try a different value", "error");

		if (fixedValue == newValue)
			return;
	
		g_form.setValue("id", fixedValue);
	});
}
