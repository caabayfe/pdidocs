function onCondition() {
	// When UI Type is workspace and search as is active, then hide condition, script and results message for search as.
	if (g_form.getValue("ui_type") === "workspace") {
		g_form.setDisplay("search_as_condition", false);
		g_form.setDisplay("search_as_script", false);
		g_form.setDisplay("search_as_results_msg", false);
	}
}
