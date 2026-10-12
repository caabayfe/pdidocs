function onCondition() {
	g_form.setSectionDisplay("insert", true);
    g_form.setSectionDisplay("update", true);
    g_form.setSectionDisplay("delete", true);

	g_form.setDisabled("enhanced_capacity", true);
	g_form.showFieldMsg("enhanced_capacity", getMessage("Enhanced Capacity is not supported when Editable feature is enabled"), "info", false);
}
