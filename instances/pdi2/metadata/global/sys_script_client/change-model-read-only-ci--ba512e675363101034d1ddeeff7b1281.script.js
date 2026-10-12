function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var ALLOW_CI_MODIFICATION = "allow_ci_modification";

	if (!g_scratchpad.change_model)
		return;
	
	var model = g_scratchpad.change_model;

	var isReadOnly = model.containsAttribute(ALLOW_CI_MODIFICATION) ?
			!model.hasStateAttribute(ALLOW_CI_MODIFICATION) : g_form.getValue(model.field) + "" !== model.initial_state;
	
	g_form.setReadOnly("cmdb_ci", isReadOnly);
}
