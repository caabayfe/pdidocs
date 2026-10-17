function onCondition() {
	g_form.setSectionDisplay("insert", false);
    g_form.setSectionDisplay("update", false);
    g_form.setSectionDisplay("delete", false);

	g_form.setDisabled("enhanced_capacity", false);
	g_form.hideFieldMsg("enhanced_capacity", true);
}
