function openAdjustmentPopUp() {
	var count = 0;
	var gr = new GlideRecord("fm_contract_rate_card");
	gr.addQuery("contract",g_form.getUniqueValue());
	gr.query();
	while (gr.next())
		count++;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("contract_adjustment_popup");
	dialog.setWidth("800");
	dialog.setTitle(getMessage("Adjust the Contract"));
	dialog.setPreference("sys_id", g_form.getUniqueValue());
	dialog.setPreference("contract_start_date",g_form.getValue('starts'));
	dialog.setPreference("contract_end_date",g_form.getValue('ends'));
	dialog.setPreference("contract_cost", g_form.getValue('cost_adjustment'));
	dialog.setPreference("contract_amount", g_form.getValue('payment_amount'));
	dialog.setPreference("contract_ratecard", g_form.getValue('ratecard'));
	dialog.setPreference("row_count", count);
	assetSetDomainParameters(dialog);
	dialog.render(); //Open the dialog
}
