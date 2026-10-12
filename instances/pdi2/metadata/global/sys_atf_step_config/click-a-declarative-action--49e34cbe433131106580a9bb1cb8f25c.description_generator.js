(function generateDescription(step) {
	var td, label, description, value, name, id;
	var isStandardFormUI = !step.inputs.form_ui || step.inputs.form_ui.toString() === "standard_ui";
	var formUI = "";
	if (!isStandardFormUI)
		formUI = step.inputs.form_ui.getDisplayValue();

	var workspaceKey = isStandardFormUI ? "standard" : "workspace";
	var timeoutKey = step.timeout ? "_timeout" : "";
	var assertKey;
	td = GlideTableDescriptor.get(step.inputs.table);
	if (td)
		label = td.getLabel();

	var declarativeAction = step.inputs.declarative_action.getRefRecord();
	if (declarativeAction != null) {
		name = declarativeAction.getDisplayValue("label");
		id = declarativeAction.sys_id;
	} else {
		gs.error("Click a declarative action description generation error, could not find ref record '" + step.inputs.declarative_action + "'");
		return "";
	}

	if (gs.nil(step.inputs.declarative_action)) {
		gs.error("Click a declarative action description generation error, no declarative action set.");
		return "";
	}


	var messageMap = {
		"form_submitted_standard" : gs.getMessage("Confirm that browser submits '{0}' form to server when clicking declarative action '{1}'", [label, name]),
		"form_submitted_standard_timeout" : gs.getMessage("Confirm that browser submits '{0}' form to server within {1} of clicking declarative action '{2}'", [label, step.timeout.getDisplayValue(), name]),
		"form_submitted_workspace" : gs.getMessage("Confirm that browser submits '{0}' form to server when clicking declarative action '{1}' in '{2}'", [label, name, formUI]),
		"form_submitted_workspace_timeout" : gs.getMessage("Confirm that browser submits '{0}' form to server within {1} of clicking declarative action '{2}' in '{3}'", [label, step.timeout.getDisplayValue(), name, formUI]),
		"form_cancelled_standard" : gs.getMessage("Confirm that browser blocks submission of '{0}' form to server when clicking declarative action '{1}'", [label, name]),
		"form_cancelled_standard_timeout" : gs.getMessage("Confirm that browser blocks submission of '{0}' form to server within {1} of clicking declarative action '{2}'", [label, step.timeout.getDisplayValue(), name]),
		"form_cancelled_workspace" : gs.getMessage("Confirm that browser blocks submission of '{0}' form to server when clicking declarative action '{1}' in '{2}'", [label, name, formUI]),
		"form_cancelled_workspace_timeout" : gs.getMessage("Confirm that browser blocks submission of '{0}' form to server within {1} of clicking declarative action '{2}' in '{3}'", [label, step.timeout.getDisplayValue(), name, formUI]),
		"page_reload_standard" : gs.getMessage("Confirm that page reloads or redirects within {0} of clicking declarative action '{1}'", [step.timeout.getDisplayValue(), name]),
		"page_reload_workspace" : gs.getMessage("Confirm that page reloads or redirects within {0} of clicking declarative action '{1}' in '{2}'", [step.timeout.getDisplayValue(), name, formUI]),
		"workspace" : gs.getMessage("Click declarative action '{0}' on '{1}' form in '{2}'", [name, label, formUI]),
		"standard" : gs.getMessage("Click declarative action '{0}' on '{1}' form", [name, label])
	};

	// Get the messages according to the assert type
	if (step.inputs.assert_type == 'form_submitted_to_server') {
		assertKey = "form_submitted_";
		description = messageMap[assertKey + workspaceKey + timeoutKey];
	} else if  (step.inputs.assert_type == 'form_submission_canceled_in_browser') {
		assertKey = "form_cancelled_";
		description = messageMap[assertKey + workspaceKey + timeoutKey];
	} else if (step.inputs.assert_type == 'page_reloaded_or_redirected') {
		assertKey = "page_reload_";
		description = messageMap[assertKey + workspaceKey];
	}
	else
		description = messageMap[workspaceKey];

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
