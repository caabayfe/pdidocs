function onCondition() {
	var columnsValue = g_form.getValue("columns");
	var viewValue = g_form.getValue("view");
	
	if (viewValue && columnsValue) {
		return;
	}
	
	if (columnsValue) {
		g_form.setMandatory("view", false);
		g_form.setDisabled("view", true);
	}
	
	if (viewValue) {
		g_form.setMandatory("columns", false);
		g_form.setDisabled("columns", true);
	}
}
