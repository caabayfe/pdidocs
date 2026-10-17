(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord(current.table);
	var field = '';
	if (current.getValue('output_field')) 
		field = current.getValue('output_field');
		var ed = gr.getElement(field).getED();
		var isEdgeEncryption = ed.isEdgeEncrypted();
		var isPlatformEncryption = ed.isEncrypted();

		if (isEdgeEncryption) {
			var errorMessage = gs.getMessage('Output field cannot be encrypted');
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
		} else if (isPlatformEncryption) {
			var message = gs.getMessage('The field {0} is platform encrypted. Please ensure you assign the correct role to sharedservice.worker in order to build an accurate model.', gr.getElement(field).getLabel());
			gs.addInfoMessage(message);
		}
})(current, previous);
