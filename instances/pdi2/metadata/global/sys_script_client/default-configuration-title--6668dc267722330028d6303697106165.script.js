function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	if (newValue === "workspace") 
		g_form.setValue("results_header_text", "Agent Assist");
	else if (newValue === "platform") 
		g_form.setValue("results_header_text", "Related Search Results");
}
