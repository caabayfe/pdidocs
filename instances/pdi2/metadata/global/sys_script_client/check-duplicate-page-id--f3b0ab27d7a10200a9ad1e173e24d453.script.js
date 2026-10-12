function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '' || isLoading)
		return;

	if (g_form.getValue("title") == "")
		g_form.setValue("title", newValue);

	var name = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (name.indexOf("__") != -1) 
		name = name.replace(/__/g, "_");

	// Replace any trailing underscores
	while (name != '' && name.charAt(name.length - 1) == '_') 
		name = name.substring(0, name.length - 1);
	
	if (newValue != name) {
		g_form.setValue("id", name);
		return;
	}

	var page = new GlideRecord("sp_page");
	page.addQuery("id", g_form.getValue("id"));
	page.addQuery("sys_id", "!=", g_form.getUniqueValue());
	page.query(pageCallback);
}

function pageCallback(page) {
	if (page.next()) {
		g_form.showErrorBox("id", "Page ID already exists, use a different ID");
		return;
	}
}
