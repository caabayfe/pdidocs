function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	if (g_form.getValue("search_as_active") === "true") {
		if (g_form.getValue("ui_type") === "workspace") {
			g_form.setDisplay("search_as_condition", false);
			g_form.setDisplay("search_as_script", false);
			g_form.setDisplay("search_as_results_msg", false);
		} else if (g_form.getValue("ui_type") === "platform") {
			g_form.setDisplay("search_as_condition", true);
			g_form.setDisplay("search_as_script", true);
			g_form.setDisplay("search_as_results_msg", true);
		}
	}
}
