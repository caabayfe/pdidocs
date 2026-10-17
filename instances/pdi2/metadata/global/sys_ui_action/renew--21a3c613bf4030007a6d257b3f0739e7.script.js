function openPopUp() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("contract_renew_popup");
	dialog.setWidth("800");
	dialog.setTitle(getMessage("Renew the Contract"));
	dialog.setPreference("sys_id", g_form.getUniqueValue());
	dialog.setPreference("renew_contact",g_form.getValue('renewal_contact'));
	dialog.setPreference("renew_date",g_form.getValue('renewal_date'));
	dialog.setPreference("renew_end_date",g_form.getValue('renewal_end_date'));
	dialog.setPreference("renew_option", g_form.getValue('renewal_options'));
	dialog.setPreference("cost_type", g_form.getValue('cost_adjustment_type'));
	dialog.setPreference("cost_adjustment", g_form.getValue('cost_adjustment'));
	dialog.setPreference("cost_percentage", g_form.getValue('cost_adjustment_percentage'));
	dialog.setPreference("contract_start_date",g_form.getValue('starts'));
	dialog.setPreference("short_text", "Please verify or update the conditions of this contract renewal:");
	dialog.setPreference("approver", g_form.getValue('approver'));
	assetSetDomainParameters(dialog);
	dialog.render(); //Open the dialog
}
