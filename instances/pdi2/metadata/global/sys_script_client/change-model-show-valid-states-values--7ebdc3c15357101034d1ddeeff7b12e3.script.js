function onLoad() {
	if (!g_scratchpad.change_model)
		return;

	//Only update states if field is editable
	var isReadOnly = false;
	var model = g_scratchpad.change_model;
	var stateControl = g_form.getControl(model.field);
	if (stateControl instanceof HTMLSelectElement) {
		var stateElement = g_form.getElement(model.field);
		isReadOnly = g_form.isReadOnly(stateElement, stateControl);
	} else
		isReadOnly = g_form.isReadOnly(model.field); // For SP and Workspace

	if (!isReadOnly)
		g_scratchpad.change_model.updateStates();
}
