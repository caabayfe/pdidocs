function generateDescription() {
	var ui_page, button; 
	if (step.inputs.ui_page != null || step.inputs.ui_page != "")
		ui_page = step.inputs.ui_page.getDisplayValue();
	
	if (step.inputs.button != null)
		button = step.inputs.button;

	var isStandardFormUI = !step.inputs.form_ui || step.inputs.form_ui == 'standard_ui';
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description = '';
	if (isStandardFormUI)
		description = gs.getMessage("Click on the button with id '{0}' within the modal UI page '{1}'", [button, ui_page]);
	else {
		var formUI = step.inputs.form_ui.getDisplayValue();
		var modalAction = step.inputs.modal_action.getDisplayValue();
		if (step.inputs.modal_values) {
			var modalValues = JSON.parse(step.inputs.modal_values);
			var keys = Object.keys(modalValues);
			description += gs.getMessage("Set the values within the modal in '{0}' as follows:", [formUI]) + '\n';
			for (var i = 0; i < keys.length; i += 1)
				description += gs.getMessage("{0} = '{1}'", [keys[i], modalValues[keys[i]]]) + '\n';

			description += '\n';
			description += gs.getMessage("Click the '{0}' modal action", [modalAction]);
		} else
			description += gs.getMessage("Click the '{0}' modal action within the modal in '{1}'", [modalAction, formUI]);
	}

	description += descriptionGenerator.getTimeoutDescription(step.timeout);

	if (step.inputs.assert_type == 'page_reloaded') {
		if (!step.inputs.assertion_timeout)
			description += '\n' + gs.getMessage("Assert the modal is closed and page is reloaded or redirected");
		else
			description += '\n' + gs.getMessage("Assert the modal is closed and page is reloaded or redirected within {0}", step.inputs.assertion_timeout.getDisplayValue());
	} else if (step.inputs.assert_type == 'page_not_reloaded') {
		if (!step.inputs.assertion_timeout)
			description += '\n' + gs.getMessage("Assert the modal is closed and page not reloaded or redirected");
		else
			description += '\n' + gs.getMessage("Assert the modal is closed and page not reloaded or redirected after {0}", step.inputs.assertion_timeout.getDisplayValue());
	} else if (step.inputs.assert_type == 'modal_not_closed') {
		if (!step.inputs.assertion_timeout)
			description += '\n' + gs.getMessage("Assert the modal is not closed");
		else
			description += '\n' + gs.getMessage("Assert the modal is not closed after {0}", step.inputs.assertion_timeout.getDisplayValue());
	}

	return description;
}

generateDescription();
