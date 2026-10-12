function generateDescription(step) {
    // the global variable 'step' represents the current glide record
	var descriptionGenerator = new ATFStepDescriptionGenerator();
    var description = gs.getMessage("Validate that the answer match the following condition:") + "\n";
	var scAtfUtil = new SCATFUtil();
	description += scAtfUtil.getValueValidationDescription(step.inputs.catalog_conditions);
	//Use breadcrumbs to generate the query english text
	description += descriptionGenerator.getTimeoutDescription(step.timeout);
	return description;
}
 generateDescription(step);
