(function executeRule(current, previous /*null when async*/) {

	function isAttributeExists(attributeName, attributeInput) {
		var attribute = new GlideRecord("sys_sg_input_attribute");
		attribute.addQuery("name", attributeName);
		attribute.addQuery("input", attributeInput);
		attribute.setLimit(1);
		attribute.query();
		
		return attribute.next();
	}
	
	function abort(current, message) {
		current.setAbortAction(true);
		gs.addErrorMessage(message);
	}

	var attributeName = current.name.toString();
	var attributeInput = current.input.toString();
	var attributeValue = current.value.toString();

	// Check if parent input is of type attachment
	var isInputTypeAttachment = current.input.type.name.toString() === "attachment";
	if (!isInputTypeAttachment)
		return;

	// Check if attribute already exists for the current input
	if (current.operation() === "insert" && isAttributeExists(attributeName, attributeInput)) {
		abort(current, gs.getMessage("Attribute already exists for input. Try entering a different name to proceed."));
		return;
	}

	// Validate attribute value based on attribute name
	if (attributeName === "HiddenAttachmentSources")
		new AttachmentGranularUtils().isValid(attributeValue);

})(current, previous);
