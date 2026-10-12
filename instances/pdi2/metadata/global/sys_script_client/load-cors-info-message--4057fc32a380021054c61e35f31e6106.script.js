function onLoad() {
	if (g_form.getValue("use_resource_path") == "true") {
		g_form.addInfoMessage(g_scratchpad["cors_info_message"]["resource_path"]);
	} else if (g_form.getValue("use_resource_path") == "false") {
		g_form.addInfoMessage(g_scratchpad["cors_info_message"]["rest_api"]);
	}
}
