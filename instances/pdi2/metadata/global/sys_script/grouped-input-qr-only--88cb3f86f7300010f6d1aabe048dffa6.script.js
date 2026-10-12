/**
 * Only allows QR Codes in the UI Parameters field.
 */
(function executeRule(current) {
	
	var uiParameter = new GlideRecord("sys_sg_ui_parameter");
	uiParameter.addQuery("sys_id", "IN", current.ui_parameters);
	uiParameter.query();
	
	while (uiParameter.next()) {
		if(uiParameter.input_type != "qr_barcode") {
			current.setAbortAction(true);
			errorMessage = gs.getMessage("UI parameters must have QR/Barcode input type for grouped input.");
			current.ui_parameters.setError(errorMessage);
			break;
		}
	}
	
})(current, previous);
