function onCondition() {
	if (typeof sc_ic_addSelectedItemDetails != 'undefined')
		new sc_ic_addSelectedItemDetails().hideDetails();
	g_form.setValue("sc_ic_aprvl_type_defn_staging", "");
}
