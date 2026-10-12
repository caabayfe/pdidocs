function generateDescription() {
	var descriptionGenerator = new ATFStepDescriptionGenerator();
    var description = gs.getMessage("Adds the following attachments to the current form:");
	description += descriptionGenerator.getAttachmentsForRecord(step.getUniqueValue());

	return description;
}
 generateDescription();
