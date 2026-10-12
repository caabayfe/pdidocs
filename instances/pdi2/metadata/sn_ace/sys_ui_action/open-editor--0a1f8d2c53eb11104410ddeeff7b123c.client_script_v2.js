function onClick(g_form) {
	var pageId = g_form.getUniqueValue();
	var appConfig = g_form.getValue('ace_app');
	open("now/ace-app-builder/editor/params/pageid/" + pageId + "/aceconfig/" + appConfig);
	// location = "now/ace-app-builder/editor/params/pageid/" + pageId + "/aceconfig/" + appConfig;
}
