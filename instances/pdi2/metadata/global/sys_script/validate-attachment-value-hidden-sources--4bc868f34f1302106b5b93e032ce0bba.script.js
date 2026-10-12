(function executeRule(current, previous /*null when async*/ ) {

	function isAttributeExists(attributeName, attributeButton) {
		var attribute = new GlideRecord("sys_sg_button_attribute");
		attribute.addQuery("name", attributeName);
		attribute.addQuery("button", attributeButton);
		attribute.setLimit(1);
		attribute.query();
		
		return attribute.next();
	}

	function abort(current, message) {
		current.setAbortAction(true);
		gs.addErrorMessage(message);
	}

	var attributeName = current.name;
	var attributeButton = current.button.toString();
	var attributeValue = current.value.toString();

	// Check if parent button is type of upload attachment
	if (current.button.type.toString() !== "attachment")
		return;

	// Check if the hidden attachment sources attribute already exists for the button attributes
	if (current.operation() === "insert" && isAttributeExists(attributeName.toString(), attributeButton)) {
		abort(current, gs.getMessage("Attribute already exists for button. Try entering a different name to proceed."));
		return;
	}
	// Validate attribute value based on attribute name
	if (attributeName.name.toString() === "hidden_attachment_sources")
		new AttachmentGranularUtils().isValid(attributeValue);
		
})(current, previous);
