(function generateDescription(step) {
	var td, label, description, value, name, id;
	if (gs.nil(step.inputs.ui_action)) {
		gs.error("Click a UI Action description generation error, no UI Action set");
		return "";
	}
	
    td = GlideTableDescriptor.get(step.inputs.table);
	if (td)
		label = td.getLabel();

	var uiAction = step.inputs.ui_action.getRefRecord();
	if (uiAction != null) {
		name = uiAction.name;
		id = uiAction.sys_id;
	} else {
		gs.error("Click a UI Action description generation error, unable to find UI Action by id: '" + step.inputs.ui_action + "'");
		return "";
	}
	
	if (step.inputs.assert_type === "form_submitted_to_server") {
		return gs.getMessage("Confirm that browser submits '{0}' form to server when clicking UI Action '{1}'", [name, label]);
	} else if (step.inputs.assert_type === "form_submission_canceled_in_browser") {
		return gs.getMessage("Confirm that browser blocks submission of '{0}' form to server when clicking UI Action '{1}'", [name, label]);
	}

	return gs.getMessage("Click UI Action '{0}' on '{1}' form", [name, label]);
})(step);
