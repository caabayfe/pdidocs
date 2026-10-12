function generateDescription(step) {
    // the global variable 'step' represents the current glide record
    var description = "";
	var scAtfUtil = new SCATFUtil();
	if (!gs.nil(step.inputs.visible))
		description = gs.getMessage("Confirm that the following variables are visible: {0}", step.inputs.visible.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	if (!gs.nil(step.inputs.not_visible))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following variables are not visible: {0}", step.inputs.not_visible.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	if (!gs.nil(step.inputs.read_only))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following variables are read only: {0}", step.inputs.read_only.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	if (!gs.nil(step.inputs.not_read_only))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following variables are not read only: {0}", step.inputs.not_read_only.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	if (!gs.nil(step.inputs.mandatory))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following variables are mandatory: {0}", step.inputs.mandatory.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	if (step.inputs.not_mandatory)
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following variables are not mandatory: {0}", step.inputs.not_mandatory.split(",").map(scAtfUtil.getVariableDisplayName).join(", "));

	description += "\n";

	var timeoutDescription = new ATFStepDescriptionGenerator().getTimeoutDescription(step.timeout);
	description += timeoutDescription;

	return description;
}
 generateDescription(step);
