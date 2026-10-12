function onClick(g_form) {
	var blockId = g_form.getUniqueValue();
	var appConfig = g_form.getValue("document_id");
	var url = "now/ace-app-builder/editor/params/blockid/" + blockId + "/aceconfig/" + appConfig;
	// action.setRedirectURL(url);
	open(url);
}
