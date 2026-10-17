function onLoad() {
	if (g_form.getValue('type'))
		return;
	
	g_form.getSectionNames().forEach(function(name) {
		g_form.setSectionDisplay(name, false);
	});
}
