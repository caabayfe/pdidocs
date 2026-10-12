function generateDescription() {
    var description = "";
	if (step.inputs.assert_type == 'form_submitted_to_server')
		description = gs.getMessage("Save & confirm that current row is successfully saved to multi-row variable set.");
	else
		description = gs.getMessage("Save & confirm that current row is not saved & cancelled in browser.");
	return description;
}
 generateDescription();
