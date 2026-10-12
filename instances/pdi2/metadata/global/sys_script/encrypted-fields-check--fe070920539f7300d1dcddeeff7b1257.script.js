(function executeRule(current, previous /*null when async*/) {
	if (JSUtil.nil(current.table) || JSUtil.nil(current.getValue('fields'))) {
		return;
	}
	var gr = new GlideRecord(current.table);
	var fields = current.getValue('fields').split(',');
	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		var ed = gr.getElement(field).getED();
		var isEdgeEncryption = ed.isEdgeEncrypted();
		var isPlatformEncryption = ed.isEncrypted();

		if (isEdgeEncryption) {
			var errorMessage = gs.getMessage('Fields cannot be encrypted');
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
		} else if (isPlatformEncryption) {
			var message = gs.getMessage('The field {0} is platform encrypted. Please ensure you assign the correct role to sharedservice.worker in order to build an accurate model.', gr.getElement(field).getLabel());
			gs.addInfoMessage(message);
		}
	}
})(current, previous);
