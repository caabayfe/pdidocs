function onChange() {
	var shouldShow = !!g_form.getValue('type');
	g_form.getSectionNames().forEach(function(name) {
		g_form.setSectionDisplay(name, shouldShow);
	});
}
