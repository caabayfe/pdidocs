function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var model = g_form.getValue("model");
	if(model === "c3547169534723003eddddeeff7b126c" || model === "d91731a9534723003eddddeeff7b121c"){
		if (newValue === "uxf_client_action") {
			g_form.setVisible("workspace", false);
		}
		else if (g_form.isNewRecord()){
				g_form.setVisible("workspace", false);
		}
		else g_form.setVisible("workspace", true);
	}
}
