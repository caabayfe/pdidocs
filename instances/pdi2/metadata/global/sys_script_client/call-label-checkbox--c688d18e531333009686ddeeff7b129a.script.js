function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(!isLoading) { 
		if(newValue === "false") {
			g_form.setDisabled("support_phone", true);
			g_form.clearValue("support_phone");
			g_form.clearValue("support_phone_label");
			g_form.setDisabled("support_phone_label", true);
		}
		else {
			g_form.setValue("support_phone","1-800-555-5555");
			g_form.setValue("support_phone_label","Call Support (Daily 5AM - 11 PM)");
			g_form.setDisabled("support_phone_label", false);
			g_form.setDisabled("support_phone", false);
		}
	}
}
