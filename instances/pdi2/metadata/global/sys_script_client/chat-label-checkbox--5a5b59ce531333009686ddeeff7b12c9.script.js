function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(!isLoading) { 
		if(newValue === "false") {
			g_form.clearValue("support_hours_label");
			g_form.setDisabled("support_hours_label", true);
		}
		else {
			g_form.setValue("support_hours_label","Contact Live Agent");
			g_form.setDisabled("support_hours_label", false);
		}
	}
}
