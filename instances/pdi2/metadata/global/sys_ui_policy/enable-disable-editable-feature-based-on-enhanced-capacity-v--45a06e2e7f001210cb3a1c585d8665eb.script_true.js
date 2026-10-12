function onCondition() {
    g_form.setDisabled("editable", true);
	g_form.showFieldMsg("editable", getMessage("Editable feature is not supported with Enhanced Capacity"), "info", false);
}
