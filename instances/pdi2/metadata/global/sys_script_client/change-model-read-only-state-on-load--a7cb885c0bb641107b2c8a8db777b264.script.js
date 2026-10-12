function onLoad() {
	var model = g_scratchpad.change_model;
	if (!model)
		return;

	if (g_form.getValue("approval") + "" === "requested" || g_form.getValue("on_hold") + "" === "true")
		g_form.setReadOnly(model.field, true);
	else
		g_form.setReadOnly(model.field, false);
}
