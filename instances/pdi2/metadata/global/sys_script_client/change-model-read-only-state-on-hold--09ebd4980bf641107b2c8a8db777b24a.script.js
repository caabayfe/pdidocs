function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var model = g_scratchpad.change_model;
	if (isLoading || newValue === "" || !model)
		return;

	if (newValue === "true")
		g_form.setReadOnly(model.field, true);
	else if (g_form.getValue("approval") + "" !== "requested") {
		g_form.setReadOnly(model.field, false);
		model.requestRefreshUpdateModel();
	}
}
