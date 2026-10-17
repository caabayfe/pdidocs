function moveToInprogress() {
	g_form.setValue("state", g_scratchpad.states.WIP);
	gsftSubmit(null, g_form.getFormElement(), "std_chg_move_to_in_progress");
}

if (typeof window === 'undefined') {
	var sncStdChngTemplateSkipValidationInBr = true;
	setRedirect();
}

function setRedirect() {
	var stdChangeUtils = new StdChangeUtils();

	if (stdChangeUtils.isRetireTemplate(current))
		current.state = stdChangeUtils.STATE_WIP;
	else {
		//Default the template name if not poulated - this is normally done by BR but in this case
		//Validation is happening before the update.
		if (current.template_name.nil() && !current.short_description.nil())
			current.template_name = current.short_description;

		/* Validate this proposal for:
			 - required fields
			 - template value compliance with standard change properties
			 - task template compliance with standard change properties
		*/
		var validationSuccessful = stdChangeUtils.validateProposal(current, true /* Show errors */, true /* Validate tasks */);
		if (validationSuccessful)
			current.state = stdChangeUtils.STATE_WIP;
		else
			current.state = stdChangeUtils.STATE_NEW;
	}

	// Update in all cases to save any form changes. State should not update if validation fails.
	current.update();
	action.setRedirectURL(current);
}
