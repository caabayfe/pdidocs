function onLoad() {
	
	// If a template is set, use it to set the table
	var template = g_form.getValue("template");
	if (template != null && template != "")
		if (g_form.getReference("template").table != g_form.getValue("table")) 
			g_form.setValue("table", g_form.getReference("template").table);
	else {
		var filter = g_form.getValue("filter");
		if (filter != null && filter != "")
			if (g_form.getReference("filter").table != g_form.getValue("table"))
				g_form.setValue("table", g_form.getReference("filter").table);
	}
}
