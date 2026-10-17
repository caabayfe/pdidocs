function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(!isLoading) { 
		if(newValue === "false") {
			g_form.clearValue("support_email");
			g_form.setDisabled("support_email", true);
			g_form.clearValue("support_email_label");
			g_form.setDisabled("support_email_label", true);
		}
		else {
			g_form.setValue("support_email","support@example.com");
			g_form.setDisabled("support_email", false);
			g_form.setValue("support_email_label","Send Email to Customer Support");
			g_form.setDisabled("support_email_label", false);
		}
	}
}
